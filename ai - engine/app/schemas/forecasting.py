"""
Pydantic Schemas for Phase 7 Advanced AI, Demand Forecasting,
Smart Recommendations, Environmental Carbon Analytics, and Model Governance.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal

class HistoricalVolumeRecord(BaseModel):
    date: str # YYYY-MM-DD
    corridor: str # e.g. "Nashik-Mumbai"
    commodity: str # "ONIONS", "TOMATOES", "VEGETABLES", "GRAIN", "FRUITS"
    volume_metric_tons: float = Field(..., ge=0)
    num_shipments: int = Field(default=1, ge=1)
    day_of_week: Optional[str] = None # Monday, Tuesday, ...

class DemandForecastRequest(BaseModel):
    corridor: str = "Nashik-Mumbai"
    commodity: str = "PERISHABLE_PRODUCE"
    target_date: str # YYYY-MM-DD
    historical_records: Optional[List[HistoricalVolumeRecord]] = None
    forecast_horizon_days: int = Field(default=7, ge=1, le=30)
    preferred_model: Literal["AUTO", "EXPONENTIAL_SMOOTHING", "RANDOM_FOREST", "MOVING_AVERAGE"] = "AUTO"

class DayForecastDetail(BaseModel):
    date: str
    day_of_week: str
    is_mandi_peak_day: bool
    predicted_volume_tons: float
    confidence_80_lower_tons: float
    confidence_80_upper_tons: float
    confidence_95_lower_tons: float
    confidence_95_upper_tons: float
    estimated_trucks_required_count: int
    demand_level: Literal["LOW", "MODERATE", "HIGH", "PEAK_HARVEST"]

class ModelEvaluationMetrics(BaseModel):
    mean_absolute_error_tons: float
    root_mean_squared_error_tons: float
    weighted_absolute_pct_error: float
    validation_strategy: str = "WALK_FORWARD_TIME_SERIES_SPLIT"
    train_record_count: int
    test_record_count: int

class DemandForecastResponse(BaseModel):
    success: bool
    corridor: str
    commodity: str
    model_used: str
    is_fallback_baseline: bool
    data_limitation_warning: Optional[str] = None
    forecast_summary: str
    daily_forecasts: List[DayForecastDetail]
    aggregated_7day_volume_tons: float
    seasonal_pattern: str
    model_evaluation: Optional[ModelEvaluationMetrics] = None
    explainability_notes: List[str]

class OperationalRecommendation(BaseModel):
    recommendation_id: str
    category: Literal[
        "OPTIMAL_DEPARTURE_WINDOW",
        "SHIPMENT_POOLING_CLUSTER",
        "FLEET_CAPACITY_ALIGNMENT",
        "BACKHAUL_OPPORTUNITY",
        "CORRIDOR_ALTERNATIVE"
    ]
    title: str
    recommendation: str
    estimated_benefit: str
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    priority: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    explainability: str
    actionable_parameters: Dict[str, Any]

class SmartRecommendationsRequest(BaseModel):
    corridor: str = "Nashik-Mumbai"
    origin_district: str = "Nashik"
    destination_market: str = "Vashi APMC"
    planned_departure_date: str
    cargo_category: str = "PERISHABLE_PRODUCE"
    cargo_weight_kg: float = 1200.0
    current_time_window_start: Optional[str] = "08:00"

class SmartRecommendationsResponse(BaseModel):
    success: bool
    corridor: str
    target_date: str
    recommendations_count: int
    recommendations: List[OperationalRecommendation]
    generated_at: str

class EnvironmentalImpactRequest(BaseModel):
    distance_km: float = Field(..., gt=0)
    cargo_weight_kg: float = Field(..., gt=0)
    vehicle_type: str = "Tata 407 / Eicher 14ft (3.5T)"
    is_consolidated: bool = True
    num_consolidated_shippers: int = Field(default=2, ge=1)
    solo_direct_truck_count: int = Field(default=2, ge=1)

class EmissionMetrics(BaseModel):
    distance_km: float
    fuel_consumed_liters: float
    co2_emissions_kg: float
    co2_emissions_metric_tons: float
    fuel_efficiency_km_per_liter: float

class EnvironmentalImpactResponse(BaseModel):
    success: bool
    methodology: str = "ESTIMATED_DERIVED_MODEL (Diesel 2.68 kg CO2e/L)"
    data_classification: Literal["ESTIMATED_DERIVED_MODEL", "MEASURED_DIRECT_SENSOR"] = "ESTIMATED_DERIVED_MODEL"
    disclaimer: str = "Emissions are model-derived estimates calculated from payload, vehicle class, and road circuity. Not measured via physical tailpipe sensor."
    optimized_shared_trip: EmissionMetrics
    solo_baseline_trips: EmissionMetrics
    net_fuel_saved_liters: float
    net_co2_avoided_kg: float
    emissions_reduction_percentage: float
    environmental_equivalencies: Dict[str, str]

class ModelRegistryItem(BaseModel):
    model_id: str
    model_name: str
    model_type: str
    version: str
    status: Literal["PRODUCTION", "CHALLENGER", "DEPRECATED", "FALLBACK"]
    trained_on_date: str
    training_data_summary: Dict[str, Any]
    evaluation_metrics: Dict[str, float]
    drift_status: Literal["NORMAL", "DRIFT_SUSPECTED", "RETRAINING_RECOMMENDED"]
    drift_z_score: float

class ModelRegistryResponse(BaseModel):
    success: bool
    active_production_model: str
    registered_models: List[ModelRegistryItem]
    drift_monitoring_enabled: bool = True

class VolumePrediction(BaseModel):
    predicted_volume_tons: float
    confidence_interval_lower_tons: float
    confidence_interval_upper_tons: float
    seasonal_trend: str
    peak_dispatch_days: List[str]

class CargoVolumeForecastRequest(BaseModel):
    district: str = "Nashik"
    commodity: str = "ONIONS"

class CargoVolumeForecastResponse(BaseModel):
    success: bool
    district: str
    commodity: str
    prediction: VolumePrediction
    model_version: str = "v1.0-seasonal-baseline"
