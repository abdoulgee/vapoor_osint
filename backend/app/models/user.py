"""
User model with role-based access control.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User roles for RBAC."""
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.ANALYST, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    cases_created = relationship("Case", back_populates="creator", foreign_keys="Case.created_by")
    case_assignments = relationship("CaseAssignment", back_populates="user")
    markers_created = relationship("Marker", back_populates="creator")

    # ✅ FIX: explicitly specify foreign_keys
    evidence_uploaded = relationship(
        "Evidence",
        back_populates="uploader",
        foreign_keys="Evidence.uploaded_by"
    )

    # ✅ ADD THIS (missing relationship)
    evidence_reviewed = relationship(
        "Evidence",
        back_populates="reviewer",
        foreign_keys="Evidence.reviewed_by"
    )

    foi_requests = relationship("FOIRequest", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")