"""
Configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # App Info
    APP_NAME: str = "Healthcare Chatbot"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Google Cloud / Vertex AI
    GOOGLE_CLOUD_PROJECT: str
    GOOGLE_APPLICATION_CREDENTIALS: str
    VERTEX_AI_LOCATION: str = "us-central1"
    VERTEX_AI_MODEL: str = "gemini-pro"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Chat Settings
    DEFAULT_LANGUAGE: str = "en"
    MAX_TOKENS: int = 1024
    TEMPERATURE: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()