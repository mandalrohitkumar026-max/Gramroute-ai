"""
Transparent Rural Freight Cost Allocation Engine.
Allocates consolidated trip costs among multiple shippers using proportional Ton-Km (Weight x Distance)
with marginal detour contribution and stop handling surcharges.
"""
from typing import List, Dict, Any, Optional
from app.schemas.optimization import (
    VehicleRouteResult,
    ShipmentItem,
    VehicleItem,
    CostAllocationReport,
    CostAllocationItem
)
from app.optimization.routing_provider import FallbackRoadMatrixProvider

class CostAllocationEngine:
    def __init__(self):
        self.road_provider = FallbackRoadMatrixProvider()

    def allocate_trip_costs(
        self,
        vehicle: VehicleItem,
        route_result: VehicleRouteResult,
        shipments: List[ShipmentItem]
    ) -> CostAllocationReport:
        assigned_ids = set(route_result.assigned_shipments)
        assigned_shipments = [s for s in shipments if s.shipment_id in assigned_ids]

        if not assigned_shipments:
            return CostAllocationReport(
                total_trip_cost_inr=0.0,
                fixed_mobilization_cost_inr=0.0,
                running_distance_cost_inr=0.0,
                stop_service_cost_inr=0.0,
                total_shipments_consolidated=0,
                allocations=[],
                sum_allocated_inr=0.0,
                cost_recovery_balanced=True
            )

        total_trip_cost = route_result.estimated_trip_cost_inr
        fixed_cost = vehicle.fixed_mobilization_cost_inr
        running_cost = round(route_result.total_distance_km * vehicle.cost_per_km_inr, 2)
        total_stops = len([s for s in route_result.stops if s.stop_type in ("PICKUP", "DELIVERY")])
        stop_service_cost = total_stops * 150.0 # Rs. 150 per stop

        # Step 1: Calculate direct road distance & ton-km for each shipment
        shipment_direct_distances: Dict[str, float] = {}
        shipment_ton_km: Dict[str, float] = {}
        total_ton_km = 0.0

        for s in assigned_shipments:
            dist_km = self.road_provider._calculate_road_distance_km(
                s.pickup_location.lat, s.pickup_location.lon,
                s.delivery_location.lat, s.delivery_location.lon
            )
            # Ensure minimum billing distance 10 km
            dist_km = max(dist_km, 10.0)
            shipment_direct_distances[s.shipment_id] = dist_km
            t_km = (s.weight_kg / 1000.0) * dist_km
            shipment_ton_km[s.shipment_id] = t_km
            total_ton_km += t_km

        if total_ton_km <= 0.0:
            total_ton_km = 1.0

        # Step 2: Proportional Base Cost Allocation
        # Base pool covers fixed vehicle mobilization + fuel running distance
        base_cost_pool = fixed_cost + running_cost
        preliminary_allocations: List[Dict[str, Any]] = []

        for s in assigned_shipments:
            t_km = shipment_ton_km[s.shipment_id]
            share_pct = (t_km / total_ton_km) * 100.0
            base_allocated = (t_km / total_ton_km) * base_cost_pool

            # Stop handling charge: 2 stops (1 pickup + 1 delivery) = Rs. 300
            stop_charge = 300.0

            # Detour contribution: If shipment direct distance < route distance / N, assess detour share
            detour_charge = 0.0
            direct_dist = shipment_direct_distances[s.shipment_id]
            if route_result.total_distance_km > (direct_dist * 1.25):
                detour_km = min(route_result.total_distance_km - direct_dist, 25.0)
                detour_charge = round((detour_km * vehicle.cost_per_km_inr) / len(assigned_shipments), 2)

            # Benchmark: Dedicated solo truck hire cost (fixed mobilization Rs. 1500 + round-trip km at Rs. 24/km + stop labor)
            solo_round_trip_km = direct_dist * 2.0
            solo_benchmark_cost = round(1500.0 + (solo_round_trip_km * 24.0) + 300.0, 2)

            subtotal = base_allocated + stop_charge + detour_charge

            preliminary_allocations.append({
                "shipment": s,
                "direct_dist": direct_dist,
                "ton_km": t_km,
                "share_pct": share_pct,
                "base_allocated": base_allocated,
                "stop_charge": stop_charge,
                "detour_charge": detour_charge,
                "solo_benchmark_cost": solo_benchmark_cost,
                "subtotal": subtotal
            })

        # Step 3: Exact Budget Balancing Reconciliation
        # Ensure that sum of individual charges exactly matches total_trip_cost
        prelim_sum = sum(p["subtotal"] for p in preliminary_allocations)
        scaling_factor = total_trip_cost / prelim_sum if prelim_sum > 0 else 1.0

        final_allocation_items: List[CostAllocationItem] = []
        running_sum = 0.0

        for p in preliminary_allocations:
            s = p["shipment"]
            final_charge = round(p["subtotal"] * scaling_factor, 2)
            running_sum += final_charge
            solo_cost = p["solo_benchmark_cost"]
            net_savings = round(max(solo_cost - final_charge, 0.0), 2)
            savings_pct = round((net_savings / solo_cost) * 100.0, 1) if solo_cost > 0 else 0.0

            explanation = (
                f"Assigned {p['share_pct']:.1f}% share based on {s.weight_kg:.0f} kg carried over "
                f"{p['direct_dist']:.1f} km ({p['ton_km']:.1f} ton-km). "
                f"Saved Rs. {net_savings:,.0f} ({savings_pct:.1f}%) versus dedicated solo truck hire."
            )

            final_allocation_items.append(
                CostAllocationItem(
                    shipment_id=s.shipment_id,
                    shipper_name=s.shipper_name or f"Shipper ({s.shipment_id})",
                    weight_kg=s.weight_kg,
                    direct_distance_km=round(p["direct_dist"], 1),
                    ton_km=round(p["ton_km"], 2),
                    ton_km_share_pct=round(p["share_pct"], 1),
                    base_allocated_cost_inr=round(p["base_allocated"] * scaling_factor, 2),
                    stop_handling_charge_inr=round(p["stop_charge"], 2),
                    detour_contribution_charge_inr=round(p["detour_charge"], 2),
                    total_allocated_cost_inr=final_charge,
                    solo_truck_benchmark_cost_inr=solo_cost,
                    net_savings_inr=net_savings,
                    savings_percentage=savings_pct,
                    allocation_method="PROPORTIONAL_TON_KM_WITH_MARGINAL_DETOUR",
                    explanation=explanation
                )
            )

        balanced = abs(running_sum - total_trip_cost) < 5.0 # within rounding tolerance

        return CostAllocationReport(
            total_trip_cost_inr=total_trip_cost,
            fixed_mobilization_cost_inr=fixed_cost,
            running_distance_cost_inr=running_cost,
            stop_service_cost_inr=stop_service_cost,
            total_shipments_consolidated=len(assigned_shipments),
            allocations=final_allocation_items,
            sum_allocated_inr=round(running_sum, 2),
            cost_recovery_balanced=balanced
        )

cost_allocation_engine = CostAllocationEngine()
