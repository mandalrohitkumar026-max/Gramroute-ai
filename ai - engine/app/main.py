from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import health, optimization, matching, forecasting

app = FastAPI(
    title="GramRoute AI Optimization & Forecasting Engine",
    description="Microservice providing Google OR-Tools Vehicle Routing Problem (VRP) solving, load consolidation, and agricultural demand forecasting.",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(health.router)
app.include_router(optimization.router, prefix="/api/v1")
app.include_router(matching.router, prefix="/api/v1")
app.include_router(forecasting.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "GramRoute AI Optimization Engine is operational",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.AI_HOST, port=settings.AI_PORT, reload=True)
