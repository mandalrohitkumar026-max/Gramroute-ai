from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    AI_HOST: str = "0.0.0.0"
    AI_PORT: int = 8000
    AI_ENVIRONMENT: str = "development"
    BACKEND_INTERNAL_URL: str = "http://localhost:5000"
    LOG_LEVEL: str = "INFO"
    SOLVER_TIMEOUT_SECONDS: int = 30

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
