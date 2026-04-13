"""
Notification model for in-app user notifications.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # e.g., "case_assigned", "evidence_uploaded"
    is_read = Column(Boolean, default=False, nullable=False)
    entity_type = Column(String(100), nullable=True)  # e.g., "case", "evidence"
    entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
