"""
Configuration settings - For Custom Tuned Vertex AI Model
"""
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # App Info
    APP_NAME: str = "Healthcare Chatbot"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Google Cloud / Vertex AI - Tuned Model
    GOOGLE_CLOUD_PROJECT: str  # Your project ID
    # Service account JSON key path (optional). Set this to use a key file instead of gcloud login.
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None  # e.g. /path/to/service-account-key.json
    GOOGLE_API_KEY: Optional[str] = None  # Not used for Vertex AI; kept for optional use
    
    # Vertex AI Settings
    VERTEX_AI_LOCATION: str = "europe-west4"  # Your model's region
    VERTEX_AI_MODEL: str = "gemini-2.5-flash"  # Base model
    
    # Your Tuned Model Endpoint ID (extract from model name)
    # From: projects/82533503826/locations/europe-west4/models/6026891623793688576@1
    VERTEX_AI_TUNED_ENDPOINT_ID: Optional[str] = None  # Deployed endpoint ID (if model is deployed)
    VERTEX_AI_TUNED_MODEL_ID: Optional[str] = None  # Tuned model ID (e.g. 6026891623793688576@1)
    
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