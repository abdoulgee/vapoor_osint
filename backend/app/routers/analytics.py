"""
Analytics router: dashboard statistics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.services.analytics_service import get_dashboard_stats
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregate dashboard statistics."""
    return get_dashboard_stats(db)
