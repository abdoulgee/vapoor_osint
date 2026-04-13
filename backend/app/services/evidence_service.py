"""
Evidence service: file upload/download management with approval pipeline.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.models.evidence import Evidence, EvidenceStatus
from app.models.marker import Marker
from app.models.user import User, UserRole
from app.services.audit_service import log_action
from app.services.notification_service import create_notification
from app.services.timeline_service import log_event
from app.models.timeline import ActionType


def upload_evidence(
    db: Session,
    marker_id: int,
    file: UploadFile,
    user: User,
) -> Evidence:
    """Upload an evidence file and link it to a marker. Status starts as PENDING."""
    marker = db.query(Marker).filter(Marker.id == marker_id).first()
    if not marker:
        raise ValueError("Marker not found")

    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise ValueError(f"File type {file.content_type} not allowed. Allowed: {allowed_types}")

    case_dir = os.path.join(settings.UPLOAD_DIR, str(marker.case_id))
    os.makedirs(case_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(case_dir, unique_name)

    with open(file_path, "wb") as f:
        content = file.file.read()
        f.write(content)

    evidence = Evidence(
        marker_id=marker_id,
        file_path=file_path,
        file_type=file.content_type,
        original_filename=file.filename or "unknown",
        uploaded_by=user.id,
        status=EvidenceStatus.PENDING,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    log_action(db, user.id, "uploaded", "evidence", evidence.id, {
        "marker_id": marker_id, "filename": file.filename,
    })

    # Timeline event
    log_event(db, marker.case_id, user.id, ActionType.EVIDENCE_UPLOADED,
              f'Evidence "{file.filename}" uploaded to marker "{marker.title}"')

    if marker.created_by != user.id:
        create_notification(
            db, marker.created_by,
            f'New evidence uploaded to marker "{marker.title}" (pending approval)',
            "evidence_uploaded", "evidence", evidence.id,
        )

    return evidence


def approve_evidence(db: Session, evidence_id: int, user: User) -> Optional[Evidence]:
    """Approve evidence. Manager/Admin only."""
    if user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise PermissionError("Only managers and admins can approve evidence")

    evidence = db.query(Evidence).options(
        joinedload(Evidence.marker)
    ).filter(Evidence.id == evidence_id).first()
    if not evidence:
        return None

    evidence.status = EvidenceStatus.APPROVED
    evidence.reviewed_by = user.id
    evidence.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(evidence)

    log_action(db, user.id, "approved", "evidence", evidence_id)

    log_event(db, evidence.marker.case_id, user.id, ActionType.EVIDENCE_APPROVED,
              f'Evidence "{evidence.original_filename}" approved')

    if evidence.uploaded_by != user.id:
        create_notification(
            db, evidence.uploaded_by,
            f'Your evidence "{evidence.original_filename}" has been approved',
            "evidence_approved", "evidence", evidence_id,
        )

    return evidence


def reject_evidence(db: Session, evidence_id: int, user: User, notes: str = None) -> Optional[Evidence]:
    """Reject evidence. Manager/Admin only."""
    if user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise PermissionError("Only managers and admins can reject evidence")

    evidence = db.query(Evidence).options(
        joinedload(Evidence.marker)
    ).filter(Evidence.id == evidence_id).first()
    if not evidence:
        return None

    evidence.status = EvidenceStatus.REJECTED
    evidence.reviewed_by = user.id
    evidence.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(evidence)

    log_action(db, user.id, "rejected", "evidence", evidence_id, {"notes": notes})

    log_event(db, evidence.marker.case_id, user.id, ActionType.EVIDENCE_REJECTED,
              f'Evidence "{evidence.original_filename}" rejected' + (f': {notes}' if notes else ''))

    if evidence.uploaded_by != user.id:
        create_notification(
            db, evidence.uploaded_by,
            f'Your evidence "{evidence.original_filename}" has been rejected' + (f': {notes}' if notes else ''),
            "evidence_rejected", "evidence", evidence_id,
        )

    return evidence


def get_evidence_for_marker(db: Session, marker_id: int) -> list:
    """Get all evidence files for a specific marker."""
    return db.query(Evidence).options(
        joinedload(Evidence.uploader),
        joinedload(Evidence.reviewer),
    ).filter(Evidence.marker_id == marker_id).order_by(Evidence.created_at.desc()).all()


def get_evidence_by_id(db: Session, evidence_id: int) -> Optional[Evidence]:
    """Get a single evidence record by ID."""
    return db.query(Evidence).options(
        joinedload(Evidence.uploader),
        joinedload(Evidence.reviewer),
    ).filter(Evidence.id == evidence_id).first()


def delete_evidence(db: Session, evidence_id: int, user: User) -> bool:
    """Delete an evidence file and record. Admin/Manager only."""
    if user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise PermissionError("Only managers and admins can delete evidence")

    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        return False

    if os.path.exists(evidence.file_path):
        os.remove(evidence.file_path)

    db.delete(evidence)
    db.commit()

    log_action(db, user.id, "deleted", "evidence", evidence_id)
    return True
