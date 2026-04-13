"""
Audit log service: centralized audit trail recording.
"""

import json
from typing import Optional
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: Optional[int] = None,
    details: Optional[dict] = None,
) -> AuditLog:
    """Record an action in the audit log."""
    audit = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=json.dumps(details) if details else None,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
) -> tuple:
    """Retrieve audit logs with optional filters. Returns (items, total)."""
    query = db.query(AuditLog)

    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    total = query.count()
    items = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    return items, total
