"""
Pydantic schemas for Case management.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.user import UserResponse


class CaseCreate(BaseModel):
    """Schema for creating a new case."""
    title: str
    description: Optional[str] = None
    status: Optional[str] = "open"


class CaseUpdate(BaseModel):
    """Schema for updating an existing case."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class CaseAssignmentRequest(BaseModel):
    """Schema for assigning/unassigning users to/from a case."""
    user_ids: List[int]


class CaseAssignmentResponse(BaseModel):
    """Schema for case assignment data."""
    id: int
    user_id: int
    assigned_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class CaseResponse(BaseModel):
    """Schema for case data in API responses."""
    id: int
    title: str
    description: Optional[str] = None
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None
    assignments: Optional[List[CaseAssignmentResponse]] = []

    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    """Schema for paginated case list."""
    items: List[CaseResponse]
    total: int
