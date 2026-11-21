from pydantic import BaseModel, Field
from typing import List, Tuple

class ShipmentCandidate(BaseModel):
    shipment_id: str
    weight_kg: float
    volume_cubic_meters: float
    perishability: str
    origin_coordinates: Tuple[float, float]
    destination_coordinates: Tuple[float, float]

class ConsolidationMatchRequest(BaseModel):
    vehicle_id: str
    max_payload_kg: float
    max_volume_cubic_meters: float
    planned_route_origin: Tuple[float, float]
    planned_route_destination: Tuple[float, float]
    candidate_shipments: List[ShipmentCandidate]

class MatchEvaluation(BaseModel):
    selected_shipment_ids: List[str]
    consolidation_score: float = Field(ge=0, le=100)
    compatibility_score: float = Field(ge=0, le=100)
    route_efficiency_score: float = Field(ge=0, le=100)
    estimated_cost_savings_percentage: float
    empty_backhaul_reduction_km: float

class ConsolidationMatchResponse(BaseModel):
    success: bool
    top_matches: List[MatchEvaluation]
