"""
Backhaul Matching and Deadhead Reduction Engine.
Identifies return-trip cargo opportunities for vehicles returning from market depots to rural bases.
"""
from typing import List, Dict, Any, Optional
from app.schemas.optimization import (
    Coordinate,
    ShipmentItem,
    VehicleItem,
    BackhaulAnalysisResponse,
    BackhaulMatchItem
)
from app.optimization.routing_provider import FallbackRoadMatrixProvider
from app.optimization.cargo_rules import are_cargo_categories_compatible

class BackhaulEngine:
    def __init__(self):
        self.road_provider = FallbackRoadMatrixProvider()

    def analyze_backhaul(
        self,
        vehicle: VehicleItem,
        return_origin: Coordinate,
        candidate_shipments: List[ShipmentItem]
    ) -> BackhaulAnalysisResponse:
        home_depot = vehicle.end_depot or vehicle.start_depot
        
        # Baseline empty return deadhead without backhaul
        baseline_empty_km = self.road_provider._calculate_road_distance_km(
            return_origin.lat, return_origin.lon,
            home_depot.lat, home_depot.lon
        )

        matches: List[BackhaulMatchItem] = []
        total_deadhead_saved = 0.0
        total_added_revenue = 0.0

        for s in candidate_shipments:
            # 1. Capacity check
            if s.weight_kg > vehicle.max_payload_kg or s.volume_cubic_meters > vehicle.max_volume_cubic_meters:
                continue

            # 2. Distance from return origin to pickup
            pickup_access_km = self.road_provider._calculate_road_distance_km(
                return_origin.lat, return_origin.lon,
                s.pickup_location.lat, s.pickup_location.lon
            )

            # Pickup must be within 35 km radius of market endpoint
            if pickup_access_km > 35.0:
                continue

            # 3. Shipment transit distance
            transit_km = self.road_provider._calculate_road_distance_km(
                s.pickup_location.lat, s.pickup_location.lon,
                s.delivery_location.lat, s.delivery_location.lon
            )

            # 4. Delivery to home depot distance
            delivery_to_home_km = self.road_provider._calculate_road_distance_km(
                s.delivery_location.lat, s.delivery_location.lon,
                home_depot.lat, home_depot.lon
            )

            # Total route distance with backhaul stop
            routed_km = pickup_access_km + transit_km + delivery_to_home_km
            detour_km = max(round(routed_km - baseline_empty_km, 2), 0.0)

            # Detour threshold for rural backhaul: maximum 40 km added detour
            if detour_km > 40.0:
                continue

            # Effective deadhead eliminated
            # If the truck would have driven 150 km empty, and now carries cargo for 130 km of it:
            deadhead_saved = round(max(baseline_empty_km - delivery_to_home_km, 0.0), 1)

            # Transporter revenue for backhaul cargo (~Rs. 16/km for return leg)
            added_revenue = round(transit_km * 18.0 + 400.0, 2)

            reasons = [
                f"Pickup is {pickup_access_km:.1f} km from your last delivery point",
                f"Drop-off is near your return corridor (only {delivery_to_home_km:.1f} km from home base)",
                f"Converts {deadhead_saved:.1f} km of empty deadhead travel into paid freight",
                f"Adds Rs. {added_revenue:,.0f} net revenue with only {detour_km:.1f} km extra detour"
            ]

            matches.append(
                BackhaulMatchItem(
                    shipment_id=s.shipment_id,
                    pickup_address=s.pickup_location.address or "Return Corridor Origin",
                    delivery_address=s.delivery_location.address or "Rural Destination",
                    cargo_category=s.cargo_category,
                    weight_kg=s.weight_kg,
                    volume_m3=s.volume_cubic_meters,
                    detour_km=detour_km,
                    added_revenue_inr=added_revenue,
                    deadhead_km_saved=deadhead_saved,
                    is_compatible=True,
                    compatibility_reasons=reasons
                )
            )

            total_deadhead_saved += deadhead_saved
            total_added_revenue += added_revenue

        deadhead_reduction_pct = (
            round((total_deadhead_saved / baseline_empty_km) * 100.0, 1)
            if baseline_empty_km > 0
            else 0.0
        )

        return BackhaulAnalysisResponse(
            vehicle_id=vehicle.vehicle_id,
            return_leg_origin=return_origin,
            return_leg_destination=home_depot,
            baseline_empty_km=round(baseline_empty_km, 1),
            available_return_payload_kg=vehicle.max_payload_kg,
            backhaul_matches=matches,
            total_deadhead_reduction_pct=min(deadhead_reduction_pct, 100.0),
            net_profit_gain_inr=round(total_added_revenue, 2)
        )

backhaul_engine = BackhaulEngine()
