"""
Marker router: CRUD operations for geospatial intelligence markers.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.schemas.marker import MarkerCreate, MarkerUpdate, MarkerResponse, MarkerListResponse
from app.services.marker_service import (
    create_marker, get_markers, get_marker_by_id, update_marker, delete_marker,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/markers", tags=["Markers (Geospatial Intelligence)"])


@router.post("/", response_model=MarkerResponse, status_code=status.HTTP_201_CREATED)
def create_new_marker(
    marker_data: MarkerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new map marker on a case."""
    marker = create_marker(db, marker_data, current_user)
    return MarkerResponse.model_validate(marker)


@router.get("/", response_model=MarkerListResponse)
def list_markers(
    case_id: Optional[int] = None,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List markers with optional filters."""
    items, total = get_markers(db, case_id, skip, limit, category, risk_level, search)
    return MarkerListResponse(
        items=[MarkerResponse.model_validate(m) for m in items],
        total=total,
    )


@router.get("/{marker_id}", response_model=MarkerResponse)
def get_single_marker(
    marker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific marker by ID."""
    marker = get_marker_by_id(db, marker_id)
    if not marker:
        raise HTTPException(status_code=404, detail="Marker not found")
    return MarkerResponse.model_validate(marker)


@router.put("/{marker_id}", response_model=MarkerResponse)
def update_existing_marker(
    marker_id: int,
    marker_data: MarkerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing marker."""
    marker = update_marker(db, marker_id, marker_data, current_user)
    if not marker:
        raise HTTPException(status_code=404, detail="Marker not found")
    return MarkerResponse.model_validate(marker)


@router.delete("/{marker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_marker(
    marker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a marker."""
    if not delete_marker(db, marker_id, current_user):
        raise HTTPException(status_code=404, detail="Marker not found")
