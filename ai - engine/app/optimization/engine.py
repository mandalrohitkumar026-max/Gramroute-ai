"""
Central GramRoute AI Optimization Engine.
Orchestrates Google OR-Tools PDP-VRPTW solving, cost allocation, backhaul matching,
and comparative benchmarking.
"""
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

from app.schemas.optimization import (
    RouteOptimizationRequest,
    RouteOptimizationResponse,
    BackhaulAnalysisResponse,
    Coordinate,
    VehicleItem,
    ShipmentItem
)
from app.optimization.vrp_solver import VRPOptimizer
from app.optimization.cost_allocator import cost_allocation_engine
from app.optimization.backhaul import backhaul_engine
from app.optimization.benchmark import benchmark_engine
from app.optimization.reproducibility import audit_logger
from app.optimization.routing_provider import get_routing_provider

logger = logging.getLogger("gramroute.optimization_engine")

class CentralOptimizationEngine:
    ALGORITHM_VERSION = "v5.0-ortools-pdp-vrptw"

    def optimize_route(self, request: RouteOptimizationRequest) -> RouteOptimizationResponse:
        """
        Executes complete end-to-end multi-vehicle pickup-delivery optimization,
        transparent ton-km cost allocation, and comparative baseline benchmarking.
        """
        # Step 1: Calculate deterministic reproducibility hash
        reproducibility_hash = audit_logger.generate_reproducibility_hash(
            request.model_dump(),
            self.ALGORITHM_VERSION
        )
        timestamp_str = datetime.now(timezone.utc).isoformat()

        # Step 2: Configure solver routing provider
        provider = get_routing_provider(request.routing_mode)
        solver = VRPOptimizer(routing_provider=provider)

        # Step 3: Run Google OR-Tools PDP with Time Windows & Dual Capacity
        solution = solver.solve(request)

        if not solution["success"] and solution["status"] in ("INFEASIBLE", "NO_SOLUTION_FOUND"):
            response = RouteOptimizationResponse(
                success=False,
                status=solution["status"],
                algorithm_version=self.ALGORITHM_VERSION,
                reproducibility_hash=reproducibility_hash,
                timestamp=timestamp_str,
                total_distance_km=0.0,
                total_duration_minutes=0.0,
                total_empty_km=0.0,
                vehicle_routes=[],
                unassigned_shipments=solution["unassigned_shipments"],
                cost_allocation=None,
                benchmark=None,
                status_message=solution["message"]
            )
            audit_logger.record_run(reproducibility_hash, request.model_dump(), response.model_dump())
            return response

        routes = solution["vehicle_routes"]
        unassigned = solution["unassigned_shipments"]

        # Step 4: Cost Allocation for primary vehicle route
        cost_report = None
        if routes and request.vehicles:
            primary_vehicle = request.vehicles[0]
            cost_report = cost_allocation_engine.allocate_trip_costs(
                primary_vehicle,
                routes[0],
                request.shipments
            )

        # Step 5: Comparative Baseline Benchmarking
        assigned_shipment_ids = set()
        for r in routes:
            assigned_shipment_ids.update(r.assigned_shipments)
        assigned_shipments = [s for s in request.shipments if s.shipment_id in assigned_shipment_ids]

        benchmark_report = benchmark_engine.generate_benchmark(
            request.vehicles,
            assigned_shipments,
            routes
        )

        response = RouteOptimizationResponse(
            success=True,
            status=solution["status"],
            algorithm_version=self.ALGORITHM_VERSION,
            reproducibility_hash=reproducibility_hash,
            timestamp=timestamp_str,
            total_distance_km=solution["total_distance_km"],
            total_duration_minutes=solution["total_duration_minutes"],
            total_empty_km=solution["total_empty_km"],
            vehicle_routes=routes,
            unassigned_shipments=unassigned,
            cost_allocation=cost_report,
            benchmark=benchmark_report,
            status_message=solution["message"]
        )

        audit_logger.record_run(reproducibility_hash, request.model_dump(), response.model_dump())
        return response

    def evaluate_backhaul(
        self,
        vehicle: VehicleItem,
        return_origin: Coordinate,
        candidate_shipments: List[ShipmentItem]
    ) -> BackhaulAnalysisResponse:
        return backhaul_engine.analyze_backhaul(
            vehicle,
            return_origin,
            candidate_shipments
        )

optimization_engine = CentralOptimizationEngine()
