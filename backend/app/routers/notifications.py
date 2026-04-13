"""
Notification router: user notifications management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationListResponse
from app.services.notification_service import (
    get_user_notifications, mark_notification_read, mark_all_read,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/", response_model=NotificationListResponse)
def list_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List notifications for the current user."""
    items, unread_count = get_user_notifications(db, current_user.id, skip, limit, unread_only)
    return NotificationListResponse(
        items=[NotificationResponse.model_validate(n) for n in items],
        unread_count=unread_count,
    )


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    if not mark_notification_read(db, notification_id, current_user.id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for the current user."""
    count = mark_all_read(db, current_user.id)
    return {"message": f"{count} notifications marked as read"}
