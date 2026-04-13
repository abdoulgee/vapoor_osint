"""
Pydantic schemas for Evidence vault with approval pipeline.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.user import UserResponse


class EvidenceResponse(BaseModel):
    """Schema for evidence data in API responses."""
    id: int
    marker_id: int
    file_path: str
    file_type: str
    original_filename: str
    uploaded_by: int
    created_at: datetime
    status: str = "pending"
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    uploader: Optional[UserResponse] = None
    reviewer: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class EvidenceListResponse(BaseModel):
    """Schema for evidence list."""
    items: List[EvidenceResponse]
    total: int


class EvidenceApproval(BaseModel):
    """Schema for evidence approval/rejection."""
    notes: Optional[str] = None
