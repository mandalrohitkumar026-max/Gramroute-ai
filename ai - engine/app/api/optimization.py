import ortools
from fastapi import APIRouter, Query
from typing import List, Dict, Any

from app.schemas.optimization import (
    RouteOptimizationRequest,
    RouteOptimizationResponse,
    BackhaulRequest,
    BackhaulAnalysisResponse
)
from app.optimization.engine import optimization_engine
from app.optimization.reproducibility import audit_logger

router = APIRouter(prefix="/optimization", tags=["Route Optimization & OR-Tools VRP"])

@router.post("/route", response_model=RouteOptimizationResponse)
def optimize_route(request: RouteOptimizationRequest):
    """
    Solves multi-customer Vehicle Routing Problem with Time Windows (VRPTW),
    Pickup & Delivery precedence (PDP), dual payload/volume capacity,
    and returns transparent ton-km cost allocation & baseline benchmarks.
    """
    return optimization_engine.optimize_route(request)

@router.post("/backhaul", response_model=BackhaulAnalysisResponse)
def evaluate_backhaul(request: BackhaulRequest):
    """
    Discovers compatible reverse-leg freight on the return corridor from urban markets
    back to rural depots, reducing empty deadhead kilometers.
    """
    return optimization_engine.evaluate_backhaul(
        request.vehicle,
        request.return_origin,
        request.candidate_shipments
    )

@router.get("/audit-history")
def get_audit_history(limit: int = Query(default=20, ge=1, le=100)):
    """
    Returns recorded optimization runs with reproducibility hashes and solver parameters.
    """
    return {
        "success": True,
        "algorithm_version": optimization_engine.ALGORITHM_VERSION,
        "history": audit_logger.get_audit_history(limit)
    }

@router.get("/engine-status")
def get_engine_status():
    """
    Reports the operational status of Google OR-Tools and supported routing solvers.
    """
    return {
        "service": "gramroute-ai-optimization-engine",
        "ortools_version": getattr(ortools, "__version__", "9.15+"),
        "solvers": ["PDP", "VRPTW", "CVRP", "MULTI_DEPOT"],
        "routing_providers": ["OSRM", "ROAD_MATRIX", "SIMULATION"],
        "status": "OPERATIONAL"
    }
