"""
Pydantic schemas for Marker (geospatial intelligence).
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.user import UserResponse


class MarkerCreate(BaseModel):
    """Schema for creating a new map marker."""
    case_id: int
    title: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    risk_level: Optional[str] = "low"


class MarkerUpdate(BaseModel):
    """Schema for updating a marker."""
    title: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    risk_level: Optional[str] = None


class MarkerResponse(BaseModel):
    """Schema for marker data in API responses."""
    id: int
    case_id: int
    title: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    risk_level: str
    created_by: int
    created_at: datetime
    creator: Optional[UserResponse] = None
    evidence_count: Optional[int] = 0

    class Config:
        from_attributes = True


class MarkerListResponse(BaseModel):
    """Schema for paginated marker list."""
    items: List[MarkerResponse]
    total: int
