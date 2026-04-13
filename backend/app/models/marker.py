"""
Marker model for geospatial intelligence points of interest.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Float, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class RiskLevel(str, enum.Enum):
    """Risk assessment level for markers."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Marker(Base):
    __tablename__ = "markers"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String(100), nullable=True)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    case = relationship("Case", back_populates="markers")
    creator = relationship("User", back_populates="markers_created")
    evidence = relationship("Evidence", back_populates="marker", cascade="all, delete-orphan")
