"""
FOI (Freedom of Information) request tracking service.
"""

from typing import Optional
from sqlalchemy.orm import Session, joinedload

from app.models.foi import FOIRequest, FOIStatus
from app.models.user import User
from app.schemas.foi import FOICreate, FOIUpdate
from app.services.audit_service import log_action


def create_foi_request(db: Session, foi_data: FOICreate, user: User) -> FOIRequest:
    """Create a new FOI request."""
    foi = FOIRequest(
        case_id=foi_data.case_id,
        agency_name=foi_data.agency_name,
        request_date=foi_data.request_date,
        response_status=FOIStatus(foi_data.response_status) if foi_data.response_status else FOIStatus.PENDING,
        notes=foi_data.notes,
        documents=foi_data.documents,
        created_by=user.id,
    )
    db.add(foi)
    db.commit()
    db.refresh(foi)

    log_action(db, user.id, "created", "foi_request", foi.id, {"agency": foi.agency_name})
    return foi


def get_foi_requests(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    case_id: Optional[int] = None,
    status: Optional[str] = None,
) -> tuple:
    """Get FOI requests with optional filters. Returns (items, total)."""
    query = db.query(FOIRequest).options(joinedload(FOIRequest.creator))

    if case_id:
        query = query.filter(FOIRequest.case_id == case_id)
    if status:
        query = query.filter(FOIRequest.response_status == FOIStatus(status))

    total = query.count()
    items = query.order_by(FOIRequest.created_at.desc()).offset(skip).limit(limit).all()

    return items, total


def get_foi_by_id(db: Session, foi_id: int) -> Optional[FOIRequest]:
    """Get a single FOI request by ID."""
    return db.query(FOIRequest).options(
        joinedload(FOIRequest.creator)
    ).filter(FOIRequest.id == foi_id).first()


def update_foi_request(db: Session, foi_id: int, foi_data: FOIUpdate, user: User) -> Optional[FOIRequest]:
    """Update an existing FOI request."""
    foi = db.query(FOIRequest).filter(FOIRequest.id == foi_id).first()
    if not foi:
        return None

    if foi_data.agency_name is not None:
        foi.agency_name = foi_data.agency_name
    if foi_data.request_date is not None:
        foi.request_date = foi_data.request_date
    if foi_data.response_status is not None:
        foi.response_status = FOIStatus(foi_data.response_status)
    if foi_data.notes is not None:
        foi.notes = foi_data.notes
    if foi_data.documents is not None:
        foi.documents = foi_data.documents

    db.commit()
    db.refresh(foi)

    log_action(db, user.id, "updated", "foi_request", foi.id)
    return foi


def delete_foi_request(db: Session, foi_id: int, user: User) -> bool:
    """Delete an FOI request."""
    foi = db.query(FOIRequest).filter(FOIRequest.id == foi_id).first()
    if not foi:
        return False

    db.delete(foi)
    db.commit()

    log_action(db, user.id, "deleted", "foi_request", foi_id)
    return True
