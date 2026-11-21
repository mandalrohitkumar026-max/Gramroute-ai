"""
Reproducibility, Algorithm Auditing, and Deterministic Hash Tracking for GramRoute Optimization Runs.
"""
import hashlib
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, List

class OptimizationAuditLogger:
    def __init__(self, max_history: int = 100):
        self._history: List[Dict[str, Any]] = []
        self._max_history = max_history

    @staticmethod
    def generate_reproducibility_hash(request_dict: Dict[str, Any], algorithm_version: str) -> str:
        """
        Creates a deterministic SHA-256 signature of optimization inputs + solver version.
        """
        payload = {
            "inputs": request_dict,
            "algorithm_version": algorithm_version
        }
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]

    def record_run(
        self,
        reproducibility_hash: str,
        request_dict: Dict[str, Any],
        response_dict: Dict[str, Any],
        algorithm_version: str = "v5.0-ortools-pdp-vrptw"
    ) -> None:
        entry = {
            "reproducibility_hash": reproducibility_hash,
            "algorithm_version": algorithm_version,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_summary": {
                "trip_id": request_dict.get("trip_id"),
                "num_vehicles": len(request_dict.get("vehicles", [])),
                "num_shipments": len(request_dict.get("shipments", [])),
                "routing_mode": request_dict.get("routing_mode", "ROAD_MATRIX")
            },
            "solution_status": response_dict.get("status"),
            "total_distance_km": response_dict.get("total_distance_km"),
            "total_duration_minutes": response_dict.get("total_duration_minutes")
        }
        self._history.insert(0, entry)
        if len(self._history) > self._max_history:
            self._history.pop()

    def get_audit_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        return self._history[:limit]

audit_logger = OptimizationAuditLogger()
