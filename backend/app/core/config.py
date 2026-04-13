"""
Application configuration using Pydantic Settings.
Loads values from environment variables or .env file.
"""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the VAPOR SCAN application."""

    # Application
    APP_NAME: str = "VAPOR SCAN"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database — SQLite for dev, swap to PostgreSQL for production
    DATABASE_URL: str = "sqlite:///./vapor_scan.db"

    # JWT Authentication
    SECRET_KEY: str = "vapor-scan-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # File uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"


# Singleton settings instance
settings = Settings()
