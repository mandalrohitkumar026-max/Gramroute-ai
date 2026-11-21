from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "operational" in response.json()["message"]

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "gramroute-ai-engine"
    assert "solvers" in data

def test_route_optimization_endpoint():
    payload = {
        "trip_id": "trip_test_001",
        "vehicle_capacity_kg": 2500,
        "vehicle_capacity_cubic_meters": 12.5,
        "origin_coordinates": [20.5937, 78.9629],
        "shipments": [
            {
                "shipment_id": "ship_001",
                "pickup_coordinates": [20.6100, 78.9800],
                "delivery_coordinates": [20.7500, 79.1000],
                "weight_kg": 850,
                "volume_cubic_meters": 4.2
            }
        ]
    }
    response = client.post("/api/v1/optimization/route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["optimized_stop_sequence"]) == 2
    assert data["solver_status"] == "OPTIMAL_FOUND"
