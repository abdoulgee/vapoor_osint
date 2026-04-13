"""
Pydantic schemas for Audit Logs.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.user import UserResponse


class AuditLogResponse(BaseModel):
    """Schema for audit log data in API responses."""
    id: int
    user_id: int
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    """Schema for audit log list."""
    items: List[AuditLogResponse]
    total: int
