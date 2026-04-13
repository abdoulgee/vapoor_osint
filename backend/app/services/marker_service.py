"""
Marker service: CRUD operations for geospatial intelligence markers.
Includes timeline event logging on marker creation.
"""

from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.marker import Marker, RiskLevel
from app.models.evidence import Evidence
from app.models.user import User
from app.schemas.marker import MarkerCreate, MarkerUpdate
from app.services.audit_service import log_action
from app.services.timeline_service import log_event
from app.models.timeline import ActionType


def create_marker(db: Session, marker_data: MarkerCreate, user: User) -> Marker:
    """Create a new map marker and log timeline event."""
    marker = Marker(
        case_id=marker_data.case_id,
        title=marker_data.title,
        description=marker_data.description,
        latitude=marker_data.latitude,
        longitude=marker_data.longitude,
        category=marker_data.category,
        risk_level=RiskLevel(marker_data.risk_level) if marker_data.risk_level else RiskLevel.LOW,
        created_by=user.id,
    )
    db.add(marker)
    db.commit()
    db.refresh(marker)

    log_action(db, user.id, "created", "marker", marker.id, {"title": marker.title, "case_id": marker.case_id})
    log_event(db, marker.case_id, user.id, ActionType.MARKER_ADDED,
              f'Marker "{marker.title}" added ({marker.risk_level.value} risk) at [{marker.latitude:.4f}, {marker.longitude:.4f}]')
    return marker


def get_markers(
    db: Session,
    case_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple:
    """Get markers with optional filters. Returns (items, total)."""
    query = db.query(Marker).options(joinedload(Marker.creator))

    if case_id:
        query = query.filter(Marker.case_id == case_id)
    if category:
        query = query.filter(Marker.category == category)
    if risk_level:
        query = query.filter(Marker.risk_level == RiskLevel(risk_level))
    if search:
        query = query.filter(Marker.title.ilike(f"%{search}%"))

    total = query.count()
    items = query.order_by(Marker.created_at.desc()).offset(skip).limit(limit).all()

    for marker in items:
        marker.evidence_count = db.query(func.count(Evidence.id)).filter(
            Evidence.marker_id == marker.id
        ).scalar()

    return items, total


def get_marker_by_id(db: Session, marker_id: int) -> Optional[Marker]:
    """Get a single marker by ID."""
    marker = db.query(Marker).options(
        joinedload(Marker.creator),
        joinedload(Marker.evidence),
    ).filter(Marker.id == marker_id).first()

    if marker:
        marker.evidence_count = len(marker.evidence)
    return marker


def update_marker(db: Session, marker_id: int, marker_data: MarkerUpdate, user: User) -> Optional[Marker]:
    """Update an existing marker."""
    marker = db.query(Marker).filter(Marker.id == marker_id).first()
    if not marker:
        return None

    if marker_data.title is not None:
        marker.title = marker_data.title
    if marker_data.description is not None:
        marker.description = marker_data.description
    if marker_data.latitude is not None:
        marker.latitude = marker_data.latitude
    if marker_data.longitude is not None:
        marker.longitude = marker_data.longitude
    if marker_data.category is not None:
        marker.category = marker_data.category
    if marker_data.risk_level is not None:
        marker.risk_level = RiskLevel(marker_data.risk_level)

    db.commit()
    db.refresh(marker)

    log_action(db, user.id, "updated", "marker", marker.id)
    log_event(db, marker.case_id, user.id, ActionType.MARKER_UPDATED,
              f'Marker "{marker.title}" updated')
    return marker


def delete_marker(db: Session, marker_id: int, user: User) -> bool:
    """Delete a marker."""
    marker = db.query(Marker).filter(Marker.id == marker_id).first()
    if not marker:
        return False

    case_id = marker.case_id
    title = marker.title

    db.delete(marker)
    db.commit()

    log_action(db, user.id, "deleted", "marker", marker_id)
    log_event(db, case_id, user.id, ActionType.MARKER_DELETED,
              f'Marker "{title}" deleted')
    return True
