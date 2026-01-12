"""
Configuration management using Pydantic Settings
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Impression3D"
    DEBUG: bool = True
    VERSION: str = "1.0.0"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/impression3d"

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET: str = "impression3d-models"

    # Model Configuration
    MODEL_CACHE_DIR: str = "./models"
    GPU_DEVICE: str = "cuda:0"  # or "cpu"

    # Task Configuration
    MAX_PROMPT_LENGTH: int = 500
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_FORMATS: List[str] = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

    # Quality Settings
    QUALITY_CONFIGS: dict = {
        "low": {"resolution": 256, "num_inference_steps": 20},
        "medium": {"resolution": 512, "num_inference_steps": 50},
        "high": {"resolution": 1024, "num_inference_steps": 100},
    }

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
