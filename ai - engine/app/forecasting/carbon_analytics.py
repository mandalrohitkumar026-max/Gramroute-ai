"""
Environmental Carbon Footprint and Emissions Intelligence Engine.
Computes fuel consumption, CO2-equivalent emissions, and emissions avoided through freight consolidation.
Clearly labels results as derived estimates, distinguishing them from direct physical sensor measurements.
"""
from typing import Dict, Any
from app.schemas.forecasting import (
    EnvironmentalImpactRequest,
    EnvironmentalImpactResponse,
    EmissionMetrics
)

# Standard commercial diesel emissions factor: 2.68 kg CO2e per liter (IPCC / DEFRA Guidelines)
DIESEL_CO2_KG_PER_LITER = 2.68

class EnvironmentalAnalyticsEngine:
    def calculate_environmental_impact(self, request: EnvironmentalImpactRequest) -> EnvironmentalImpactResponse:
        dist_km = request.distance_km
        weight_kg = request.cargo_weight_kg

        # Vehicle Fuel Economy Modeling (Diesel Commercial Vehicles)
        # Base fuel consumption (liters per 100 km) + load factor
        # For a typical 3.5 Ton LCV (Tata 407 / Eicher Pro 2049):
        # Empty vehicle: ~14.5 L / 100 km (6.9 km/L)
        # Fully loaded: ~19.5 L / 100 km (5.1 km/L)
        load_fraction = min(weight_kg / 3500.0, 1.0)
        lcv_liters_per_100km = 14.5 + (5.0 * load_fraction)
        lcv_km_per_liter = 100.0 / lcv_liters_per_100km

        # 1. Consolidated Shared Trip
        shared_distance_km = dist_km
        shared_fuel_liters = round((shared_distance_km / 100.0) * lcv_liters_per_100km, 2)
        shared_co2_kg = round(shared_fuel_liters * DIESEL_CO2_KG_PER_LITER, 1)

        shared_metrics = EmissionMetrics(
            distance_km=round(shared_distance_km, 1),
            fuel_consumed_liters=shared_fuel_liters,
            co2_emissions_kg=shared_co2_kg,
            co2_emissions_metric_tons=round(shared_co2_kg / 1000.0, 3),
            fuel_efficiency_km_per_liter=round(lcv_km_per_liter, 1)
        )

        # 2. Solo Independent Baseline (Multiple smaller dedicated trucks + empty returns)
        # Each shipper books an independent light commercial truck (Tata Ace / Mahindra Bolero)
        # Smaller pickup truck empty: ~10.5 L / 100km, loaded: ~13.0 L / 100km
        solo_truck_count = max(request.solo_direct_truck_count, request.num_consolidated_shippers)
        # Forward leg + return deadhead (2x distance per truck)
        solo_total_distance_km = dist_km * 2.0 * solo_truck_count
        solo_liters_per_100km = 11.8 # Average round trip
        solo_fuel_liters = round((solo_total_distance_km / 100.0) * solo_liters_per_100km, 2)
        solo_co2_kg = round(solo_fuel_liters * DIESEL_CO2_KG_PER_LITER, 1)

        solo_metrics = EmissionMetrics(
            distance_km=round(solo_total_distance_km, 1),
            fuel_consumed_liters=solo_fuel_liters,
            co2_emissions_kg=solo_co2_kg,
            co2_emissions_metric_tons=round(solo_co2_kg / 1000.0, 3),
            fuel_efficiency_km_per_liter=round(100.0 / solo_liters_per_100km, 1)
        )

        # Net Reductions
        net_fuel_saved = round(max(solo_fuel_liters - shared_fuel_liters, 0.0), 1)
        net_co2_avoided = round(max(solo_co2_kg - shared_co2_kg, 0.0), 1)
        reduction_pct = round((net_co2_avoided / solo_co2_kg) * 100.0, 1) if solo_co2_kg > 0 else 0.0

        # Equivalencies: 1 tree absorbs ~21.77 kg CO2 per year
        trees_equivalent = round(net_co2_avoided / 21.77, 1)
        km_avoided_car = round(net_co2_avoided / 0.170, 0) # Average passenger car emits 170g CO2/km

        equivalencies = {
            "annual_tree_absorption_equivalent": f"{trees_equivalent:.1f} urban tree seedlings grown for 1 year",
            "passenger_car_distance_offset": f"{km_avoided_car:,.0f} km of standard passenger car driving eliminated",
            "diesel_fuel_saved": f"{net_fuel_saved:.1f} liters of commercial diesel conserved"
        }

        return EnvironmentalImpactResponse(
            success=True,
            methodology="ESTIMATED_DERIVED_MODEL (Diesel 2.68 kg CO2e/L)",
            data_classification="ESTIMATED_DERIVED_MODEL",
            disclaimer=(
                "Emissions are model-derived estimates calculated from payload, vehicle class, and road circuity. "
                "Not measured via physical tailpipe sensor."
            ),
            optimized_shared_trip=shared_metrics,
            solo_baseline_trips=solo_metrics,
            net_fuel_saved_liters=net_fuel_saved,
            net_co2_avoided_kg=net_co2_avoided,
            emissions_reduction_percentage=reduction_pct,
            environmental_equivalencies=equivalencies
        )

environmental_analytics_engine = EnvironmentalAnalyticsEngine()
