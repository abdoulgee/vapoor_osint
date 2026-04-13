"""
Pydantic schemas for Investigation Timeline events.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.user import UserResponse


class TimelineEventResponse(BaseModel):
    """Schema for a single timeline event."""
    id: int
    case_id: int
    user_id: int
    action_type: str
    description: str
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class TimelineListResponse(BaseModel):
    """Schema for timeline event list."""
    items: List[TimelineEventResponse]
    total: int
