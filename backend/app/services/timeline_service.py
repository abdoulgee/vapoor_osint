"""
Timeline service: automatic event logging for investigation activity.
"""

from typing import Optional, List
from sqlalchemy.orm import Session, joinedload

from app.models.timeline import InvestigationEvent, ActionType


def log_event(
    db: Session,
    case_id: int,
    user_id: int,
    action_type: ActionType,
    description: str,
) -> InvestigationEvent:
    """Log an investigation timeline event."""
    event = InvestigationEvent(
        case_id=case_id,
        user_id=user_id,
        action_type=action_type,
        description=description,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_timeline(
    db: Session,
    case_id: int,
    skip: int = 0,
    limit: int = 50,
    action_type: Optional[str] = None,
) -> tuple:
    """Get chronological timeline events for a case."""
    query = db.query(InvestigationEvent).options(
        joinedload(InvestigationEvent.user)
    ).filter(InvestigationEvent.case_id == case_id)

    if action_type:
        query = query.filter(InvestigationEvent.action_type == ActionType(action_type))

    total = query.count()
    items = query.order_by(InvestigationEvent.created_at.desc()).offset(skip).limit(limit).all()

    return items, total
