from pydantic import BaseModel, Field
from typing import List, Tuple, Literal, Optional, Dict, Any

class Coordinate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    address: Optional[str] = None
    name: Optional[str] = None

class ShipmentItem(BaseModel):
    shipment_id: str
    shipper_name: Optional[str] = None
    cargo_category: str = "GENERAL_AGRICULTURE" # PERISHABLE_PRODUCE, DRY_GRAIN, DAIRY, CHEMICAL_PESTICIDES, etc.
    cargo_description: Optional[str] = None
    is_perishable: bool = False
    perishability_class: Literal["HIGHLY_PERISHABLE", "MODERATE", "NON_PERISHABLE"] = "MODERATE"
    requires_cold_chain: bool = False
    max_transit_duration_minutes: Optional[int] = Field(default=360, ge=30, description="Hard deadline on in-transit time for perishable cargo")
    weight_kg: float = Field(..., gt=0, description="Shipment payload weight in kg")
    volume_cubic_meters: float = Field(..., gt=0, description="Shipment cargo volume in m3")
    pickup_location: Coordinate
    delivery_location: Coordinate
    # Time windows expressed in minutes relative to trip start (0 = departure time)
    pickup_earliest_min: int = Field(default=0, ge=0)
    pickup_latest_min: int = Field(default=480, ge=0) # 8 hours max window
    delivery_earliest_min: int = Field(default=0, ge=0)
    delivery_latest_min: int = Field(default=600, ge=0) # 10 hours max window
    loading_dwell_min: int = Field(default=15, ge=0, description="Minutes to load at pickup")
    unloading_dwell_min: int = Field(default=15, ge=0, description="Minutes to unload at drop")
    declared_value_inr: Optional[float] = None

class VehicleItem(BaseModel):
    vehicle_id: str
    vehicle_type: str = "Tata 407 / Eicher 14ft"
    registration_number: Optional[str] = None
    has_refrigeration: bool = False
    max_payload_kg: float = Field(..., gt=0)
    max_volume_cubic_meters: float = Field(..., gt=0)
    start_depot: Coordinate
    end_depot: Optional[Coordinate] = None # Defaults to start_depot if return-to-base
    earliest_start_min: int = Field(default=0, ge=0)
    latest_finish_min: int = Field(default=720, ge=0) # 12 hours max shift
    max_stops: int = Field(default=8, ge=2, le=20)
    cost_per_km_inr: float = Field(default=22.0, ge=5.0)
    fixed_mobilization_cost_inr: float = Field(default=800.0, ge=0.0)
    driver_rate_per_hour_inr: float = Field(default=150.0, ge=0.0)

class OptimizationWeights(BaseModel):
    distance_weight: float = Field(default=1.0, ge=0.0)
    time_weight: float = Field(default=0.5, ge=0.0)
    vehicle_count_weight: float = Field(default=100.0, ge=0.0)
    delay_penalty_weight: float = Field(default=50.0, ge=0.0)

class RouteOptimizationRequest(BaseModel):
    trip_id: Optional[str] = "TRIP-OPT-001"
    vehicles: List[VehicleItem]
    shipments: List[ShipmentItem]
    weights: Optional[OptimizationWeights] = Field(default_factory=OptimizationWeights)
    solver_timeout_seconds: Optional[int] = Field(default=10, ge=1, le=60)
    routing_mode: Literal["OSRM", "ROAD_MATRIX", "SIMULATION"] = "ROAD_MATRIX"

class StopVisit(BaseModel):
    sequence: int
    stop_type: Literal["START_DEPOT", "PICKUP", "DELIVERY", "END_DEPOT"]
    shipment_id: Optional[str] = None
    address: str
    location: Coordinate
    arrival_time_min: int
    departure_time_min: int
    dwell_time_min: int
    load_after_stop_kg: float
    load_after_stop_volume_m3: float
    utilization_percentage: float

class VehicleRouteResult(BaseModel):
    vehicle_id: str
    registration_number: Optional[str]
    stops: List[StopVisit]
    assigned_shipments: List[str]
    total_distance_km: float
    total_duration_minutes: float
    empty_return_km: float
    max_payload_utilized_kg: float
    peak_payload_utilization_pct: float
    peak_volume_utilization_pct: float
    estimated_trip_cost_inr: float

class InfeasibleShipment(BaseModel):
    shipment_id: str
    reason: str
    constraint_violated: Literal[
        "CAPACITY_EXCEEDED",
        "VOLUME_EXCEEDED",
        "TIME_WINDOW_VIOLATED",
        "INCOMPATIBLE_CARGO",
        "MAX_STOPS_EXCEEDED",
        "MAX_DURATION_EXCEEDED",
        "SOLVER_TIMEOUT"
    ]

class CostAllocationItem(BaseModel):
    shipment_id: str
    shipper_name: Optional[str]
    weight_kg: float
    direct_distance_km: float
    ton_km: float
    ton_km_share_pct: float
    base_allocated_cost_inr: float
    stop_handling_charge_inr: float
    detour_contribution_charge_inr: float
    total_allocated_cost_inr: float
    solo_truck_benchmark_cost_inr: float
    net_savings_inr: float
    savings_percentage: float
    allocation_method: str = "PROPORTIONAL_TON_KM_WITH_MARGINAL_DETOUR"
    explanation: str

class CostAllocationReport(BaseModel):
    total_trip_cost_inr: float
    fixed_mobilization_cost_inr: float
    running_distance_cost_inr: float
    stop_service_cost_inr: float
    total_shipments_consolidated: int
    allocations: List[CostAllocationItem]
    sum_allocated_inr: float
    cost_recovery_balanced: bool

class BackhaulRequest(BaseModel):
    vehicle: VehicleItem
    return_origin: Coordinate
    candidate_shipments: List[ShipmentItem]

class BackhaulMatchItem(BaseModel):
    shipment_id: str
    pickup_address: str
    delivery_address: str
    cargo_category: str
    weight_kg: float
    volume_m3: float
    detour_km: float
    added_revenue_inr: float
    deadhead_km_saved: float
    is_compatible: bool
    compatibility_reasons: List[str]

class BackhaulAnalysisResponse(BaseModel):
    vehicle_id: str
    return_leg_origin: Coordinate
    return_leg_destination: Coordinate
    baseline_empty_km: float
    available_return_payload_kg: float
    backhaul_matches: List[BackhaulMatchItem]
    total_deadhead_reduction_pct: float
    net_profit_gain_inr: float

class BenchmarkComparison(BaseModel):
    metric: str
    optimized_value: float
    independent_solo_value: float
    fcfs_baseline_value: float
    unit: str
    improvement_vs_solo_pct: float
    improvement_vs_fcfs_pct: float

class OptimizationBenchmarkReport(BaseModel):
    total_distance_km: BenchmarkComparison
    total_cost_inr: BenchmarkComparison
    average_vehicle_utilization_pct: BenchmarkComparison
    empty_running_km: BenchmarkComparison
    carbon_emissions_kg_co2: BenchmarkComparison
    summary: str

class RouteOptimizationResponse(BaseModel):
    success: bool
    status: Literal["OPTIMAL", "FEASIBLE", "INFEASIBLE", "NO_SOLUTION_FOUND"]
    algorithm_version: str = "v5.0-ortools-pdp-vrptw"
    reproducibility_hash: str
    timestamp: str
    total_distance_km: float
    total_duration_minutes: float
    total_empty_km: float
    vehicle_routes: List[VehicleRouteResult]
    unassigned_shipments: List[InfeasibleShipment]
    cost_allocation: Optional[CostAllocationReport] = None
    benchmark: Optional[OptimizationBenchmarkReport] = None
    status_message: str
