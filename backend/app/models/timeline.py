"""
InvestigationEvent model — chronological timeline of all case activity.
Auto-populated by services when markers, evidence, status, or assignments change.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class ActionType(str, enum.Enum):
    """Types of timeline actions."""
    MARKER_ADDED = "marker_added"
    MARKER_UPDATED = "marker_updated"
    MARKER_DELETED = "marker_deleted"
    EVIDENCE_UPLOADED = "evidence_uploaded"
    EVIDENCE_APPROVED = "evidence_approved"
    EVIDENCE_REJECTED = "evidence_rejected"
    STATUS_CHANGED = "status_changed"
    USER_ASSIGNED = "user_assigned"
    USER_UNASSIGNED = "user_unassigned"
    CASE_CREATED = "case_created"
    NOTE_ADDED = "note_added"
    REPORT_GENERATED = "report_generated"


class InvestigationEvent(Base):
    __tablename__ = "investigation_events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(Enum(ActionType), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    case = relationship("Case")
    user = relationship("User")
