"""
Google OR-Tools Pickup and Delivery Problem (PDP) with Time Windows (VRPTW)
and Dual Capacity Constraints (Weight & Volume).
"""
import logging
from typing import List, Dict, Tuple, Any, Optional
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

from app.schemas.optimization import (
    RouteOptimizationRequest,
    RouteOptimizationResponse,
    VehicleRouteResult,
    StopVisit,
    InfeasibleShipment,
    Coordinate,
    VehicleItem,
    ShipmentItem
)
from app.optimization.routing_provider import BaseRoutingProvider, get_routing_provider
from app.optimization.cargo_rules import are_cargo_categories_compatible

logger = logging.getLogger("gramroute.vrp_solver")

class VRPOptimizer:
    def __init__(self, routing_provider: Optional[BaseRoutingProvider] = None):
        self.routing_provider = routing_provider or get_routing_provider("ROAD_MATRIX")

    def solve(self, request: RouteOptimizationRequest) -> Dict[str, Any]:
        """
        Solves multi-vehicle PDP with time windows, dual capacity (weight & volume),
        precedence constraints, and dwell times.
        """
        vehicles = request.vehicles
        shipments = request.shipments

        if not vehicles:
            return {
                "success": False,
                "status": "INFEASIBLE",
                "message": "No vehicles provided for optimization",
                "vehicle_routes": [],
                "unassigned_shipments": []
            }

        if not shipments:
            return {
                "success": True,
                "status": "OPTIMAL",
                "message": "No shipments to route",
                "vehicle_routes": [],
                "unassigned_shipments": []
            }

        # Step 1: Pre-filter single-shipment hard feasibility
        unassigned_shipments: List[InfeasibleShipment] = []
        feasible_shipments: List[ShipmentItem] = []

        max_vehicle_payload = max(v.max_payload_kg for v in vehicles)
        max_vehicle_volume = max(v.max_volume_cubic_meters for v in vehicles)

        for s in shipments:
            if s.weight_kg > max_vehicle_payload:
                unassigned_shipments.append(
                    InfeasibleShipment(
                        shipment_id=s.shipment_id,
                        reason=f"Shipment weight ({s.weight_kg} kg) exceeds maximum available vehicle capacity ({max_vehicle_payload} kg)",
                        constraint_violated="CAPACITY_EXCEEDED"
                    )
                )
                continue

            if s.volume_cubic_meters > max_vehicle_volume:
                unassigned_shipments.append(
                    InfeasibleShipment(
                        shipment_id=s.shipment_id,
                        reason=f"Shipment volume ({s.volume_cubic_meters} m3) exceeds maximum available vehicle capacity ({max_vehicle_volume} m3)",
                        constraint_violated="VOLUME_EXCEEDED"
                    )
                )
                continue

            # Check if pickup deadline is earlier than pickup earliest
            if s.pickup_latest_min < s.pickup_earliest_min:
                unassigned_shipments.append(
                    InfeasibleShipment(
                        shipment_id=s.shipment_id,
                        reason="Pickup window deadline is earlier than earliest pickup time",
                        constraint_violated="TIME_WINDOW_VIOLATED"
                    )
                )
                continue

            # Hard Pre-Filter: Perishable Cold-Chain Feasibility Condition
            if s.requires_cold_chain and not any(v.has_refrigeration for v in vehicles):
                unassigned_shipments.append(
                    InfeasibleShipment(
                        shipment_id=s.shipment_id,
                        reason="Perishable cargo requires active cold-chain reefer vehicle but no refrigerated vehicles are available in fleet",
                        constraint_violated="COLD_CHAIN_UNAVAILABLE"
                    )
                )
                continue

            feasible_shipments.append(s)

        if not feasible_shipments:
            return {
                "success": False,
                "status": "INFEASIBLE",
                "message": "All requested shipments violated hard capacity or time-window constraints",
                "vehicle_routes": [],
                "unassigned_shipments": unassigned_shipments
            }

        # Step 2: Build Node List for OR-Tools Routing Model
        # Nodes layout:
        # 0 .. V-1: Start Depots for vehicles
        # V .. 2V-1: End Depots for vehicles
        # Next 2 * S nodes:
        #   Index: 2V + 2k       -> Pickup for shipment k
        #   Index: 2V + 2k + 1   -> Delivery for shipment k
        num_vehicles = len(vehicles)
        num_shipments = len(feasible_shipments)

        node_locations: List[Tuple[float, float]] = []
        node_addresses: List[str] = []
        node_types: List[str] = [] # "START_DEPOT", "END_DEPOT", "PICKUP", "DELIVERY"
        node_dwell_times: List[int] = [] # in minutes
        node_time_windows: List[Tuple[int, int]] = [] # (earliest, latest) in minutes
        node_weight_demands: List[int] = [] # in kg (integers for OR-Tools)
        node_volume_demands: List[int] = [] # in 100 * m3 (scaled integer)
        node_shipment_ids: List[Optional[str]] = []

        starts: List[int] = []
        ends: List[int] = []

        # Vehicle start depots
        for i, v in enumerate(vehicles):
            starts.append(len(node_locations))
            node_locations.append((v.start_depot.lat, v.start_depot.lon))
            node_addresses.append(v.start_depot.address or f"Vehicle {v.vehicle_id} Start Depot")
            node_types.append("START_DEPOT")
            node_dwell_times.append(0)
            node_time_windows.append((v.earliest_start_min, v.latest_finish_min))
            node_weight_demands.append(0)
            node_volume_demands.append(0)
            node_shipment_ids.append(None)

        # Vehicle end depots
        for i, v in enumerate(vehicles):
            ends.append(len(node_locations))
            end_loc = v.end_depot or v.start_depot
            node_locations.append((end_loc.lat, end_loc.lon))
            node_addresses.append(end_loc.address or f"Vehicle {v.vehicle_id} End Depot")
            node_types.append("END_DEPOT")
            node_dwell_times.append(0)
            node_time_windows.append((v.earliest_start_min, v.latest_finish_min))
            node_weight_demands.append(0)
            node_volume_demands.append(0)
            node_shipment_ids.append(None)

        pickup_indices: List[int] = []
        delivery_indices: List[int] = []

        # Shipment Pickups and Deliveries
        for k, s in enumerate(feasible_shipments):
            # Pickup Node
            p_idx = len(node_locations)
            pickup_indices.append(p_idx)
            node_locations.append((s.pickup_location.lat, s.pickup_location.lon))
            node_addresses.append(s.pickup_location.address or f"Pickup {s.shipment_id}")
            node_types.append("PICKUP")
            node_dwell_times.append(s.loading_dwell_min)
            node_time_windows.append((s.pickup_earliest_min, s.pickup_latest_min))
            node_weight_demands.append(int(round(s.weight_kg)))
            node_volume_demands.append(int(round(s.volume_cubic_meters * 100))) # 2 decimal places precision
            node_shipment_ids.append(s.shipment_id)

            # Delivery Node
            d_idx = len(node_locations)
            delivery_indices.append(d_idx)
            node_locations.append((s.delivery_location.lat, s.delivery_location.lon))
            node_addresses.append(s.delivery_location.address or f"Delivery {s.shipment_id}")
            node_types.append("DELIVERY")
            node_dwell_times.append(s.unloading_dwell_min)
            node_time_windows.append((s.delivery_earliest_min, s.delivery_latest_min))
            node_weight_demands.append(-int(round(s.weight_kg))) # unload
            node_volume_demands.append(-int(round(s.volume_cubic_meters * 100))) # unload
            node_shipment_ids.append(s.shipment_id)

        # Step 3: Compute Road Distance and Travel Duration Matrices
        distance_matrix_km, duration_matrix_minutes = self.routing_provider.get_distance_and_duration_matrix(
            node_locations
        )

        # Step 4: Setup OR-Tools Routing Model
        manager = pywrapcp.RoutingIndexManager(
            len(node_locations),
            num_vehicles,
            starts,
            ends
        )
        routing = pywrapcp.RoutingModel(manager)

        # Distance Callback & Arc Cost
        def distance_callback(from_index: int, to_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(round(distance_matrix_km[from_node][to_node] * 1000)) # in meters

        distance_transit_callback_idx = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(distance_transit_callback_idx)

        # Dimension 1: Weight Capacity (CVRP)
        def weight_demand_callback(from_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            return node_weight_demands[from_node]

        weight_callback_idx = routing.RegisterUnaryTransitCallback(weight_demand_callback)
        vehicle_weight_capacities = [int(round(v.max_payload_kg)) for v in vehicles]
        routing.AddDimensionWithVehicleCapacity(
            weight_callback_idx,
            0, # null capacity slack
            vehicle_weight_capacities,
            True, # start cumul to zero
            "WeightCapacity"
        )

        # Dimension 2: Volume Capacity (CVRP)
        def volume_demand_callback(from_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            return node_volume_demands[from_node]

        volume_callback_idx = routing.RegisterUnaryTransitCallback(volume_demand_callback)
        vehicle_volume_capacities = [int(round(v.max_volume_cubic_meters * 100)) for v in vehicles]
        routing.AddDimensionWithVehicleCapacity(
            volume_callback_idx,
            0,
            vehicle_volume_capacities,
            True,
            "VolumeCapacity"
        )

        # Dimension 3: Time with Travel Time + Dwell Service Time (VRPTW)
        def time_callback(from_index: int, to_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            transit_time = int(round(duration_matrix_minutes[from_node][to_node]))
            service_dwell = node_dwell_times[from_node]
            return transit_time + service_dwell

        time_callback_idx = routing.RegisterTransitCallback(time_callback)
        max_shift_minutes = max(v.latest_finish_min for v in vehicles)
        routing.AddDimension(
            time_callback_idx,
            max_shift_minutes, # allow waiting/slack
            max_shift_minutes, # maximum cumul time
            False, # do not force start cumul to zero
            "Time"
        )
        time_dimension = routing.GetDimensionOrDie("Time")

        # Set Time Windows on Nodes
        for node_idx, (earliest, latest) in enumerate(node_time_windows):
            index = manager.NodeToIndex(node_idx)
            if index != -1:
                time_dimension.CumulVar(index).SetRange(earliest, latest)

        # Dimension 4: Maximum Stops Constraint
        def stop_counter_callback(from_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            return 1 if node_types[from_node] in ("PICKUP", "DELIVERY") else 0

        stop_callback_idx = routing.RegisterUnaryTransitCallback(stop_counter_callback)
        max_stops_per_vehicle = [v.max_stops for v in vehicles]
        routing.AddDimensionWithVehicleCapacity(
            stop_callback_idx,
            0,
            max_stops_per_vehicle,
            True,
            "StopCount"
        )

        # Step 5: Pickup and Delivery Precedence & Same Vehicle Constraints (PDP)
        solver = routing.solver()
        for k in range(num_shipments):
            p_node = pickup_indices[k]
            d_node = delivery_indices[k]
            p_index = manager.NodeToIndex(p_node)
            d_index = manager.NodeToIndex(d_node)

            # Pair pickup and delivery
            routing.AddPickupAndDelivery(p_index, d_index)

            # Same vehicle constraint
            solver.Add(routing.VehicleVar(p_index) == routing.VehicleVar(d_index))

            # Precedence constraint: Pickup must precede Delivery in time
            solver.Add(time_dimension.CumulVar(p_index) <= time_dimension.CumulVar(d_index))

        # Step 6: Cargo Compatibility Constraints Between Feasible Shipments
        for i in range(num_shipments):
            for j in range(i + 1, num_shipments):
                cat_i = feasible_shipments[i].cargo_category
                cat_j = feasible_shipments[j].cargo_category
                compatible, _ = are_cargo_categories_compatible(cat_i, cat_j)
                if not compatible:
                    p_i = manager.NodeToIndex(pickup_indices[i])
                    p_j = manager.NodeToIndex(pickup_indices[j])
                    # Incompatible shipments must not be on the same vehicle
                    solver.Add(routing.VehicleVar(p_i) != routing.VehicleVar(p_j))

        # Step 7: Disjunctions (Allows dropping infeasible shipments with penalty)
        penalty_cost = 5000000 # High penalty ensures shipments are taken whenever feasible
        for k in range(num_shipments):
            p_index = manager.NodeToIndex(pickup_indices[k])
            d_index = manager.NodeToIndex(delivery_indices[k])
            routing.AddDisjunction([p_index], penalty_cost)
            routing.AddDisjunction([d_index], penalty_cost)

        # Step 8: Search Parameters & Metaheuristics
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = request.solver_timeout_seconds or 10

        # Step 9: Solve
        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            return {
                "success": False,
                "status": "NO_SOLUTION_FOUND",
                "message": "Solver could not find a feasible schedule within time limits",
                "vehicle_routes": [],
                "unassigned_shipments": unassigned_shipments + [
                    InfeasibleShipment(
                        shipment_id=s.shipment_id,
                        reason="No route could satisfy all simultaneous time-window and capacity constraints",
                        constraint_violated="NO_FEASIBLE_ROUTE"
                    )
                    for s in feasible_shipments
                ]
            }

        # Step 10: Extract Solution Routes & Metric Calculations
        vehicle_routes: List[VehicleRouteResult] = []
        assigned_shipment_ids = set()

        total_network_distance_km = 0.0
        total_network_duration_minutes = 0.0
        total_network_empty_km = 0.0

        weight_dim = routing.GetDimensionOrDie("WeightCapacity")
        volume_dim = routing.GetDimensionOrDie("VolumeCapacity")

        for v_idx, vehicle in enumerate(vehicles):
            index = routing.Start(v_idx)
            stops: List[StopVisit] = []
            assigned_to_vehicle: List[str] = []
            route_distance_km = 0.0
            route_duration_minutes = 0.0
            peak_payload_kg = 0.0
            peak_volume_m3 = 0.0
            seq = 1

            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                node_type = node_types[node]
                shipment_id = node_shipment_ids[node]
                loc = node_locations[node]

                time_var = time_dimension.CumulVar(index)
                weight_var = weight_dim.CumulVar(index)
                volume_var = volume_dim.CumulVar(index)

                arrival_min = solution.Min(time_var)
                dwell = node_dwell_times[node]
                departure_min = arrival_min + dwell
                load_kg = solution.Value(weight_var)
                load_vol = solution.Value(volume_var) / 100.0

                peak_payload_kg = max(peak_payload_kg, load_kg)
                peak_volume_m3 = max(peak_volume_m3, load_vol)

                if shipment_id and shipment_id not in assigned_to_vehicle:
                    assigned_to_vehicle.append(shipment_id)
                    assigned_shipment_ids.add(shipment_id)

                utilization_pct = round((load_kg / vehicle.max_payload_kg) * 100.0, 1)

                stops.append(
                    StopVisit(
                        sequence=seq,
                        stop_type=node_type, # type: ignore
                        shipment_id=shipment_id,
                        address=node_addresses[node],
                        location=Coordinate(lat=loc[0], lon=loc[1], address=node_addresses[node]),
                        arrival_time_min=arrival_min,
                        departure_time_min=departure_min,
                        dwell_time_min=dwell,
                        load_after_stop_kg=round(load_kg, 1),
                        load_after_stop_volume_m3=round(load_vol, 2),
                        utilization_percentage=utilization_pct
                    )
                )

                previous_index = index
                index = solution.Value(routing.NextVar(index))
                next_node = manager.IndexToNode(index)
                route_distance_km += distance_matrix_km[node][next_node]
                route_duration_minutes += duration_matrix_minutes[node][next_node] + dwell
                seq += 1

            # Append End Depot Stop
            end_node = manager.IndexToNode(index)
            end_loc = node_locations[end_node]
            end_time_var = time_dimension.CumulVar(index)
            stops.append(
                StopVisit(
                    sequence=seq,
                    stop_type="END_DEPOT",
                    shipment_id=None,
                    address=node_addresses[end_node],
                    location=Coordinate(lat=end_loc[0], lon=end_loc[1]),
                    arrival_time_min=solution.Min(end_time_var),
                    departure_time_min=solution.Min(end_time_var),
                    dwell_time_min=0,
                    load_after_stop_kg=0.0,
                    load_after_stop_volume_m3=0.0,
                    utilization_percentage=0.0
                )
            )

            # Calculate Empty Return Kilometres:
            # If the last delivery occurs before returning to end depot,
            # the leg from last drop to end depot is empty deadhead
            empty_return_km = 0.0
            if len(stops) >= 3 and assigned_to_vehicle:
                last_drop_node = manager.IndexToNode(solution.Value(routing.NextVar(previous_index)))
                # previous_index was the last drop before end depot
                empty_return_km = round(distance_matrix_km[node][end_node], 2)

            route_distance_km = round(route_distance_km, 2)
            route_duration_minutes = round(route_duration_minutes, 1)

            # Cost estimation for vehicle
            fuel_running_cost = route_distance_km * vehicle.cost_per_km_inr
            driver_cost = (route_duration_minutes / 60.0) * vehicle.driver_rate_per_hour_inr
            stop_labor_cost = len([s for s in stops if s.stop_type in ("PICKUP", "DELIVERY")]) * 150.0 # Rs. 150/stop
            total_route_cost = round(vehicle.fixed_mobilization_cost_inr + fuel_running_cost + driver_cost + stop_labor_cost, 2)

            peak_payload_pct = round((peak_payload_kg / vehicle.max_payload_kg) * 100.0, 1)
            peak_volume_pct = round((peak_volume_m3 / vehicle.max_volume_cubic_meters) * 100.0, 1)

            if assigned_to_vehicle:
                vehicle_routes.append(
                    VehicleRouteResult(
                        vehicle_id=vehicle.vehicle_id,
                        registration_number=vehicle.registration_number,
                        stops=stops,
                        assigned_shipments=assigned_to_vehicle,
                        total_distance_km=route_distance_km,
                        total_duration_minutes=route_duration_minutes,
                        empty_return_km=empty_return_km,
                        max_payload_utilized_kg=round(peak_payload_kg, 1),
                        peak_payload_utilization_pct=peak_payload_pct,
                        peak_volume_utilization_pct=peak_volume_pct,
                        estimated_trip_cost_inr=total_route_cost
                    )
                )

                total_network_distance_km += route_distance_km
                total_network_duration_minutes += route_duration_minutes
                total_network_empty_km += empty_return_km

        # Identify dropped shipments
        for s in feasible_shipments:
            if s.shipment_id not in assigned_shipment_ids:
                unassigned_shipments.append(
                    InfeasibleShipment(
                        shipment_id=s.shipment_id,
                        reason="Shipment could not be consolidated within vehicle shift time limits or stop caps",
                        constraint_violated="TIME_WINDOW_VIOLATED"
                    )
                )

        status_result = "OPTIMAL" if not unassigned_shipments else ("FEASIBLE" if assigned_shipment_ids else "INFEASIBLE")

        return {
            "success": bool(assigned_shipment_ids),
            "status": status_result,
            "message": f"Successfully planned routes for {len(assigned_shipment_ids)} shipments across {len(vehicle_routes)} vehicles" if assigned_shipment_ids else "No shipments could be feasibly assigned",
            "total_distance_km": round(total_network_distance_km, 2),
            "total_duration_minutes": round(total_network_duration_minutes, 1),
            "total_empty_km": round(total_network_empty_km, 2),
            "vehicle_routes": vehicle_routes,
            "unassigned_shipments": unassigned_shipments
        }

vrp_optimizer = VRPOptimizer()
