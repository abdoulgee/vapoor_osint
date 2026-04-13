"""
Evidence model for file attachments linked to markers.
Includes approval pipeline with status tracking.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class EvidenceStatus(str, enum.Enum):
    """Evidence approval status."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    marker_id = Column(Integer, ForeignKey("markers.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    original_filename = Column(String(255), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Approval pipeline fields
    status = Column(Enum(EvidenceStatus), default=EvidenceStatus.PENDING, nullable=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    marker = relationship("Marker", back_populates="evidence")

    uploader = relationship(
        "User",
        back_populates="evidence_uploaded",
        foreign_keys=[uploaded_by]
    )

    # ✅ FIX: add back_populates here too
    reviewer = relationship(
        "User",
        back_populates="evidence_reviewed",
        foreign_keys=[reviewed_by]
    )