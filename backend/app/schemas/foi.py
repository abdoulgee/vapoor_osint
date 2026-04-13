"""
Pydantic schemas for FOI (Freedom of Information) requests.
"""

from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.user import UserResponse


class FOICreate(BaseModel):
    """Schema for creating a new FOI request."""
    case_id: int
    agency_name: str
    request_date: date
    response_status: Optional[str] = "pending"
    notes: Optional[str] = None
    documents: Optional[str] = None


class FOIUpdate(BaseModel):
    """Schema for updating an FOI request."""
    agency_name: Optional[str] = None
    request_date: Optional[date] = None
    response_status: Optional[str] = None
    notes: Optional[str] = None
    documents: Optional[str] = None


class FOIResponse(BaseModel):
    """Schema for FOI request data in API responses."""
    id: int
    case_id: int
    agency_name: str
    request_date: date
    response_status: str
    notes: Optional[str] = None
    documents: Optional[str] = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class FOIListResponse(BaseModel):
    """Schema for FOI request list."""
    items: List[FOIResponse]
    total: int
