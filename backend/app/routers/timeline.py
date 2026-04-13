"""
Timeline router: view investigation timeline events for a case.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.schemas.timeline import TimelineEventResponse, TimelineListResponse
from app.services.timeline_service import get_timeline
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/timeline", tags=["Investigation Timeline"])


@router.get("/{case_id}", response_model=TimelineListResponse)
def get_case_timeline(
    case_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the chronological investigation timeline for a case."""
    items, total = get_timeline(db, case_id, skip, limit, action_type)
    return TimelineListResponse(
        items=[TimelineEventResponse.model_validate(e) for e in items],
        total=total,
    )
