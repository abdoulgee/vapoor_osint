"""
Audit log router: admin-only access to system audit trail.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse, AuditLogListResponse
from app.services.audit_service import get_audit_logs
from app.utils.dependencies import require_admin

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])


@router.get("/", response_model=AuditLogListResponse)
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    items, total = get_audit_logs(db, skip, limit, user_id, entity_type)


    item_ids = [item.id for item in items]
    items_with_user = db.query(AuditLog).options(
        joinedload(AuditLog.user)
    ).filter(AuditLog.id.in_(item_ids)).order_by(AuditLog.created_at.desc()).all()

    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(a) for a in items_with_user],
        total=total,
    )
