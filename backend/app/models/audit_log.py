"""
Audit log model for tracking all user actions in the system.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # e.g., "created", "updated", "deleted"
    entity_type = Column(String(100), nullable=False)  # e.g., "case", "marker", "evidence"
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)  # JSON string with additional context
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
