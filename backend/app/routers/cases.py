"""
Case management router: CRUD operations and user assignment.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseListResponse, CaseAssignmentRequest
from app.services.case_service import (
    create_case, get_cases, get_case_by_id, update_case, delete_case, assign_users,
)
from app.utils.dependencies import get_current_user, require_manager_or_admin

router = APIRouter(prefix="/api/cases", tags=["Case Management"])


@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_new_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Create a new investigation case (Manager/Admin only)."""
    case = create_case(db, case_data, current_user)
    return CaseResponse.model_validate(case)


@router.get("/", response_model=CaseListResponse)
def list_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List cases visible to the current user. Analysts see only assigned cases."""
    items, total = get_cases(db, current_user, skip, limit, status, search)
    return CaseListResponse(
        items=[CaseResponse.model_validate(c) for c in items],
        total=total,
    )


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific case by ID."""
    case = get_case_by_id(db, case_id, current_user)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")
    return CaseResponse.model_validate(case)


@router.put("/{case_id}", response_model=CaseResponse)
def update_existing_case(
    case_id: int,
    case_data: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a case. Analysts cannot change status."""
    try:
        case = update_case(db, case_id, case_data, current_user)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        return CaseResponse.model_validate(case)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Delete a case (Manager/Admin only). Analysts cannot delete."""
    try:
        if not delete_case(db, case_id, current_user):
            raise HTTPException(status_code=404, detail="Case not found")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.post("/{case_id}/assign", response_model=CaseResponse)
def assign_users_to_case(
    case_id: int,
    assignment: CaseAssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Assign users to a case (Manager/Admin only)."""
    try:
        case = assign_users(db, case_id, assignment.user_ids, current_user)
        return CaseResponse.model_validate(case)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/{case_id}/assign/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_from_case_endpoint(
    case_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Remove a user from case assignment."""
    from app.services.case_service import remove_user_from_case
    try:
        if not remove_user_from_case(db, case_id, user_id, current_user):
            raise HTTPException(status_code=404, detail="Assignment not found")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
