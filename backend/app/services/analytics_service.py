"""
Analytics service: aggregate statistics for the dashboard.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.case import Case, CaseStatus
from app.models.marker import Marker, RiskLevel
from app.models.evidence import Evidence
from app.models.foi import FOIRequest
from app.models.audit_log import AuditLog
from app.models.user import User


def get_dashboard_stats(db: Session) -> dict:
    """Get aggregate statistics for the analytics dashboard."""
    total_cases = db.query(func.count(Case.id)).scalar()
    active_cases = db.query(func.count(Case.id)).filter(
        Case.status.in_([CaseStatus.OPEN, CaseStatus.INVESTIGATING])
    ).scalar()
    closed_cases = db.query(func.count(Case.id)).filter(
        Case.status == CaseStatus.CLOSED
    ).scalar()

    total_markers = db.query(func.count(Marker.id)).scalar()
    high_risk_markers = db.query(func.count(Marker.id)).filter(
        Marker.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL])
    ).scalar()

    total_evidence = db.query(func.count(Evidence.id)).scalar()
    total_foi = db.query(func.count(FOIRequest.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()

    # Risk level breakdown
    risk_breakdown = {}
    for level in RiskLevel:
        count = db.query(func.count(Marker.id)).filter(Marker.risk_level == level).scalar()
        risk_breakdown[level.value] = count

    # Case status breakdown
    status_breakdown = {}
    for status in CaseStatus:
        count = db.query(func.count(Case.id)).filter(Case.status == status).scalar()
        status_breakdown[status.value] = count

    # Recent activity (last 10 audit logs)
    recent_activity = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).limit(10).all()

    return {
        "total_cases": total_cases,
        "active_cases": active_cases,
        "closed_cases": closed_cases,
        "total_markers": total_markers,
        "high_risk_markers": high_risk_markers,
        "total_evidence": total_evidence,
        "total_foi": total_foi,
        "total_users": total_users,
        "risk_breakdown": risk_breakdown,
        "status_breakdown": status_breakdown,
        "recent_activity": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "action": a.action,
                "entity_type": a.entity_type,
                "entity_id": a.entity_id,
                "created_at": a.created_at.isoformat(),
            }
            for a in recent_activity
        ],
    }
