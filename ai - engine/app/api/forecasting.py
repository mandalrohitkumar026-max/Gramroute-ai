from fastapi import APIRouter
from app.schemas.forecasting import CargoVolumeForecastRequest, CargoVolumeForecastResponse
from app.forecasting.engine import forecasting_engine

router = APIRouter(prefix="/forecasting", tags=["Demand Forecasting"])

@router.post("/volume", response_model=CargoVolumeForecastResponse)
def forecast_freight_volume(request: CargoVolumeForecastRequest):
    return forecasting_engine.forecast_volume(request)
