"""
FOI (Freedom of Information) request tracking router.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.schemas.foi import FOICreate, FOIUpdate, FOIResponse, FOIListResponse
from app.services.foi_service import (
    create_foi_request, get_foi_requests, get_foi_by_id, update_foi_request, delete_foi_request,
)
from app.utils.dependencies import get_current_user, require_manager_or_admin

router = APIRouter(prefix="/api/foi", tags=["FOI Tracking"])


@router.post("/", response_model=FOIResponse, status_code=status.HTTP_201_CREATED)
def create_new_foi(
    foi_data: FOICreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new FOI request."""
    foi = create_foi_request(db, foi_data, current_user)
    return FOIResponse.model_validate(foi)


@router.get("/", response_model=FOIListResponse)
def list_foi(
    case_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List FOI requests with optional filters."""
    items, total = get_foi_requests(db, skip, limit, case_id, status_filter)
    return FOIListResponse(
        items=[FOIResponse.model_validate(f) for f in items],
        total=total,
    )


@router.get("/{foi_id}", response_model=FOIResponse)
def get_single_foi(
    foi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific FOI request by ID."""
    foi = get_foi_by_id(db, foi_id)
    if not foi:
        raise HTTPException(status_code=404, detail="FOI request not found")
    return FOIResponse.model_validate(foi)


@router.put("/{foi_id}", response_model=FOIResponse)
def update_existing_foi(
    foi_id: int,
    foi_data: FOIUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Update an FOI request (Manager/Admin only)."""
    foi = update_foi_request(db, foi_id, foi_data, current_user)
    if not foi:
        raise HTTPException(status_code=404, detail="FOI request not found")
    return FOIResponse.model_validate(foi)


@router.delete("/{foi_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_foi(
    foi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Delete an FOI request (Manager/Admin only)."""
    if not delete_foi_request(db, foi_id, current_user):
        raise HTTPException(status_code=404, detail="FOI request not found")
