"""
Evidence router: file upload, approval pipeline, and management.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.core.database import get_db
from app.models.user import User
from app.schemas.evidence import EvidenceResponse, EvidenceListResponse, EvidenceApproval
from app.services.evidence_service import (
    upload_evidence, get_evidence_for_marker, get_evidence_by_id,
    delete_evidence, approve_evidence, reject_evidence,
)
from app.utils.dependencies import get_current_user, require_manager_or_admin

router = APIRouter(prefix="/api/evidence", tags=["Evidence Vault"])


@router.post("/{marker_id}", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def upload_evidence_file(
    marker_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload an evidence file. Status starts as PENDING."""
    try:
        evidence = upload_evidence(db, marker_id, file, current_user)
        return EvidenceResponse.model_validate(evidence)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{evidence_id}/approve", response_model=EvidenceResponse)
def approve_evidence_file(
    evidence_id: int,
    body: EvidenceApproval = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Approve an evidence file. Manager/Admin only."""
    try:
        evidence = approve_evidence(db, evidence_id, current_user)
        if not evidence:
            raise HTTPException(status_code=404, detail="Evidence not found")
        return EvidenceResponse.model_validate(evidence)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.put("/{evidence_id}/reject", response_model=EvidenceResponse)
def reject_evidence_file(
    evidence_id: int,
    body: EvidenceApproval = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Reject an evidence file. Manager/Admin only."""
    try:
        notes = body.notes if body else None
        evidence = reject_evidence(db, evidence_id, current_user, notes)
        if not evidence:
            raise HTTPException(status_code=404, detail="Evidence not found")
        return EvidenceResponse.model_validate(evidence)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/marker/{marker_id}", response_model=EvidenceListResponse)
def list_evidence_for_marker(
    marker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all evidence files for a specific marker."""
    items = get_evidence_for_marker(db, marker_id)
    return EvidenceListResponse(
        items=[EvidenceResponse.model_validate(e) for e in items],
        total=len(items),
    )


@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_single_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific evidence record by ID."""
    evidence = get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return EvidenceResponse.model_validate(evidence)


@router.get("/{evidence_id}/download")
def download_evidence_file(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download an evidence file."""
    evidence = get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    if not os.path.exists(evidence.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(
        evidence.file_path,
        filename=evidence.original_filename,
        media_type=evidence.file_type,
    )


@router.delete("/{evidence_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evidence_file(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Delete an evidence file. Manager/Admin only."""
    try:
        if not delete_evidence(db, evidence_id, current_user):
            raise HTTPException(status_code=404, detail="Evidence not found")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
