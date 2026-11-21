from fastapi import APIRouter
from datetime import datetime
import time

router = APIRouter()
START_TIME = time.time()

@router.get("/health")
def get_health():
    return {
        "status": "UP",
        "service": "gramroute-ai-engine",
        "version": "0.1.0",
        "uptime_seconds": int(time.time() - START_TIME),
        "solvers": {
            "google_ortools": "READY",
            "scikit_learn": "READY"
        },
        "timestamp": datetime.utcnow().isoformat()
    }
