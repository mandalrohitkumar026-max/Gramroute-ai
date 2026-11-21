from fastapi import APIRouter
from app.schemas.matching import ConsolidationMatchRequest, ConsolidationMatchResponse
from app.matching.engine import matching_engine

router = APIRouter(prefix="/matching", tags=["Consolidation Matching"])

@router.post("/consolidate", response_model=ConsolidationMatchResponse)
def evaluate_consolidation_matches(request: ConsolidationMatchRequest):
    return matching_engine.evaluate_matches(request)
