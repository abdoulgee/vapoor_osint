"""
FOI (Freedom of Information) request tracking model.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class FOIStatus(str, enum.Enum):
    """Status of a Freedom of Information request."""
    PENDING = "pending"
    SUBMITTED = "submitted"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
    APPEALED = "appealed"


class FOIRequest(Base):
    __tablename__ = "foi_requests"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    agency_name = Column(String(255), nullable=False)
    request_date = Column(Date, nullable=False)
    response_status = Column(Enum(FOIStatus), default=FOIStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)
    documents = Column(Text, nullable=True)  # Comma-separated file paths or JSON
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    case = relationship("Case", back_populates="foi_requests")
    creator = relationship("User", back_populates="foi_requests")
