"""
Pydantic schemas for Notifications.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    """Schema for notification data in API responses."""
    id: int
    user_id: int
    message: str
    type: str
    is_read: bool
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Schema for notification list."""
    items: List[NotificationResponse]
    unread_count: int
