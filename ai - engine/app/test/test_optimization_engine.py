"""
Automated Test Suite for GramRoute AI Optimization Engine (Phase 5).
Validates Google OR-Tools PDP, VRPTW, Capacity Constraints, Precedence,
Cargo Isolation, Cost Allocation, and Benchmarking.
"""
import pytest
from app.schemas.optimization import (
    RouteOptimizationRequest,
    VehicleItem,
    ShipmentItem,
    Coordinate,
    BackhaulRequest
)
from app.optimization.engine import optimization_engine
from app.optimization.cargo_rules import are_cargo_categories_compatible
from app.optimization.reproducibility import audit_logger

# Sample Coordinates in Maharashtra Rural Corridor (Nashik - Mumbai corridor)
NASHIK_DEPOT = Coordinate(lat=19.9975, lon=73.7898, address="Nashik Central Fleet Yard")
OZAR_FARM = Coordinate(lat=20.0932, lon=73.9167, address="Ozar Tomato Farm Gate")
PIMPALGAON_MANDI = Coordinate(lat=20.1742, lon=73.9854, address="Pimpalgaon Onion Hub")
THANE_GODOWN = Coordinate(lat=19.2183, lon=72.9781, address="Thane Cold Storage")
VASHI_APMC = Coordinate(lat=19.0760, lon=72.9986, address="Vashi APMC Market Navi Mumbai")

@pytest.fixture
def default_vehicle():
    return VehicleItem(
        vehicle_id="VEH-TATA-407",
        vehicle_type="Tata 407 LPT (3.5 Ton)",
        registration_number="MH 15 BD 4070",
        max_payload_kg=2800.0,
        max_volume_cubic_meters=14.0,
        start_depot=NASHIK_DEPOT,
        end_depot=NASHIK_DEPOT,
        earliest_start_min=0,
        latest_finish_min=720, # 12 hours
        max_stops=8,
        cost_per_km_inr=22.0,
        fixed_mobilization_cost_inr=800.0,
        driver_rate_per_hour_inr=150.0
    )

def test_capacity_constraints_rejection(default_vehicle):
    """Verifies that shipments exceeding vehicle payload capacity are strictly rejected."""
    heavy_shipment = ShipmentItem(
        shipment_id="SHP-OVERWEIGHT",
        cargo_category="DRY_GRAIN",
        weight_kg=3500.0, # Exceeds 2800 kg limit
        volume_cubic_meters=8.0,
        pickup_location=OZAR_FARM,
        delivery_location=VASHI_APMC
    )

    request = RouteOptimizationRequest(
        vehicles=[default_vehicle],
        shipments=[heavy_shipment]
    )

    response = optimization_engine.optimize_route(request)
    assert not response.success or len(response.unassigned_shipments) > 0
    assert any(u.constraint_violated == "CAPACITY_EXCEEDED" for u in response.unassigned_shipments)

def test_pickup_before_delivery_precedence(default_vehicle):
    """Verifies that every shipment's pickup stop strictly precedes its delivery in sequence."""
    s1 = ShipmentItem(
        shipment_id="SHP-TOMATO-01",
        cargo_category="PERISHABLE_PRODUCE",
        weight_kg=750.0,
        volume_cubic_meters=3.5,
        pickup_location=OZAR_FARM,
        delivery_location=VASHI_APMC
    )
    s2 = ShipmentItem(
        shipment_id="SHP-ONION-02",
        cargo_category="PERISHABLE_PRODUCE",
        weight_kg=900.0,
        volume_cubic_meters=4.0,
        pickup_location=PIMPALGAON_MANDI,
        delivery_location=THANE_GODOWN
    )

    request = RouteOptimizationRequest(
        vehicles=[default_vehicle],
        shipments=[s1, s2]
    )

    response = optimization_engine.optimize_route(request)
    assert response.success
    assert len(response.vehicle_routes) == 1

    route = response.vehicle_routes[0]
    stops = route.stops

    # Verify precedence for each shipment
    for s_id in ["SHP-TOMATO-01", "SHP-ONION-02"]:
        pickup_stop = next(st for st in stops if st.shipment_id == s_id and st.stop_type == "PICKUP")
        delivery_stop = next(st for st in stops if st.shipment_id == s_id and st.stop_type == "DELIVERY")
        assert pickup_stop.sequence < delivery_stop.sequence, f"Pickup must precede Delivery for {s_id}"
        assert pickup_stop.departure_time_min <= delivery_stop.arrival_time_min

def test_time_window_deadline_feasibility(default_vehicle):
    """Verifies that an unachievable tight deadline is flagged as infeasible."""
    impossible_deadline_shipment = ShipmentItem(
        shipment_id="SHP-TIGHT-DEADLINE",
        cargo_category="PERISHABLE_PRODUCE",
        weight_kg=500.0,
        volume_cubic_meters=2.0,
        pickup_location=OZAR_FARM,
        delivery_location=VASHI_APMC, # ~160 km away, requires > 200 minutes
        delivery_earliest_min=0,
        delivery_latest_min=30 # Impossible to drive 160 km in 30 mins
    )

    request = RouteOptimizationRequest(
        vehicles=[default_vehicle],
        shipments=[impossible_deadline_shipment]
    )

    response = optimization_engine.optimize_route(request)
    assert len(response.unassigned_shipments) > 0
    assert any(u.shipment_id == "SHP-TIGHT-DEADLINE" for u in response.unassigned_shipments)

def test_incompatible_cargo_isolation():
    """Verifies that toxic chemical pesticides cannot share a vehicle with fresh food."""
    compatible, reason = are_cargo_categories_compatible(
        "PERISHABLE_PRODUCE",
        "CHEMICAL_PESTICIDES"
    )
    assert not compatible
    assert "biosecurity" in reason.lower() or "toxic" in reason.lower()

def test_cost_allocation_budget_reconciliation(default_vehicle):
    """Verifies that individual allocated costs exactly match total vehicle trip cost."""
    s1 = ShipmentItem(
        shipment_id="SHP-01",
        shipper_name="Farmer Ramesh",
        weight_kg=600.0,
        volume_cubic_meters=2.5,
        pickup_location=OZAR_FARM,
        delivery_location=VASHI_APMC
    )
    s2 = ShipmentItem(
        shipment_id="SHP-02",
        shipper_name="Farmer Suresh",
        weight_kg=1000.0,
        volume_cubic_meters=4.0,
        pickup_location=PIMPALGAON_MANDI,
        delivery_location=VASHI_APMC
    )

    request = RouteOptimizationRequest(
        vehicles=[default_vehicle],
        shipments=[s1, s2]
    )

    response = optimization_engine.optimize_route(request)
    assert response.cost_allocation is not None
    cost_report = response.cost_allocation

    # The sum of individual allocations must equal total trip cost
    sum_individual = sum(a.total_allocated_cost_inr for a in cost_report.allocations)
    assert abs(sum_individual - cost_report.total_trip_cost_inr) < 5.0
    assert cost_report.cost_recovery_balanced

    # Both shippers must enjoy savings compared to a solo truck hire
    for alloc in cost_report.allocations:
        assert alloc.net_savings_inr > 0
        assert alloc.savings_percentage > 15.0

def test_benchmarking_metrics(default_vehicle):
    """Verifies that the benchmark comparison produces valid positive improvements against baselines."""
    s1 = ShipmentItem(
        shipment_id="SHP-01",
        weight_kg=800.0,
        volume_cubic_meters=3.0,
        pickup_location=OZAR_FARM,
        delivery_location=VASHI_APMC
    )
    s2 = ShipmentItem(
        shipment_id="SHP-02",
        weight_kg=1100.0,
        volume_cubic_meters=4.5,
        pickup_location=PIMPALGAON_MANDI,
        delivery_location=VASHI_APMC
    )

    request = RouteOptimizationRequest(
        vehicles=[default_vehicle],
        shipments=[s1, s2]
    )

    response = optimization_engine.optimize_route(request)
    assert response.benchmark is not None
    bm = response.benchmark

    # Consolidated optimization must cut total vehicle distance vs solo hires
    assert bm.total_distance_km.improvement_vs_solo_pct > 20.0
    # Vehicle utilization must increase
    assert bm.average_vehicle_utilization_pct.optimized_value > bm.average_vehicle_utilization_pct.independent_solo_value
    # Carbon emissions must decrease
    assert bm.carbon_emissions_kg_co2.improvement_vs_solo_pct > 20.0

def test_backhaul_deadhead_reduction(default_vehicle):
    """Verifies that backhaul matching identifies return corridor cargo and reduces deadhead."""
    return_cargo = ShipmentItem(
        shipment_id="SHP-RETURN-CRATES",
        cargo_category="PACKAGING_MATERIAL",
        cargo_description="Plastic Crates for Harvest",
        weight_kg=1200.0,
        volume_cubic_meters=7.0,
        pickup_location=Coordinate(lat=19.1200, lon=73.0100, address="Navi Mumbai Industrial Area"),
        delivery_location=Coordinate(lat=19.9800, lon=73.7700, address="Nashik Agricultural Co-op")
    )

    backhaul_res = optimization_engine.evaluate_backhaul(
        vehicle=default_vehicle,
        return_origin=VASHI_APMC,
        candidate_shipments=[return_cargo]
    )

    assert len(backhaul_res.backhaul_matches) == 1
    match = backhaul_res.backhaul_matches[0]
    assert match.is_compatible
    assert match.deadhead_km_saved > 50.0
    assert backhaul_res.total_deadhead_reduction_pct > 50.0

def test_reproducibility_hash(default_vehicle):
    """Verifies that identical inputs generate identical reproducibility hashes."""
    s = ShipmentItem(
        shipment_id="SHP-REP-01",
        weight_kg=500.0,
        volume_cubic_meters=2.0,
        pickup_location=OZAR_FARM,
        delivery_location=VASHI_APMC
    )
    req = RouteOptimizationRequest(vehicles=[default_vehicle], shipments=[s])

    h1 = audit_logger.generate_reproducibility_hash(req.model_dump(), "v5.0-ortools-pdp-vrptw")
    h2 = audit_logger.generate_reproducibility_hash(req.model_dump(), "v5.0-ortools-pdp-vrptw")
    assert h1 == h2
    assert len(h1) == 16
