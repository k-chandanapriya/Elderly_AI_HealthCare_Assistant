"""
Pydantic schemas for chat
"""
from pydantic import BaseModel, Field
from typing import Optional


class ChatMessage(BaseModel):
    """Chat message request"""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    session_id: Optional[str] = Field(default="default", description="Session ID for conversation continuity")
    language: str = Field(default="en", description="Language code")


class ChatResponse(BaseModel):
    """Chat response"""
    response: str = Field(..., description="AI's response")
    session_id: str = Field(..., description="Session ID")
    model: str = Field(..., description="Model used")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    model: Optional[str] = None