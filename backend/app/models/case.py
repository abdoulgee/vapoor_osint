"""
Case and CaseAssignment models for investigation management.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class CaseStatus(str, enum.Enum):
    """Investigation case status."""
    OPEN = "open"
    INVESTIGATING = "investigating"
    CLOSED = "closed"


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(CaseStatus), default=CaseStatus.OPEN, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="cases_created", foreign_keys=[created_by])
    assignments = relationship("CaseAssignment", back_populates="case", cascade="all, delete-orphan")
    markers = relationship("Marker", back_populates="case", cascade="all, delete-orphan")
    foi_requests = relationship("FOIRequest", back_populates="case", cascade="all, delete-orphan")


class CaseAssignment(Base):
    """Many-to-many relationship between cases and assigned users."""
    __tablename__ = "case_assignments"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    case = relationship("Case", back_populates="assignments")
    user = relationship("User", back_populates="case_assignments")
