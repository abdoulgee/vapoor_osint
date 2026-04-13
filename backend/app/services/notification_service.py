"""
Notification service: create and manage in-app notifications.
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    message: str,
    notification_type: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
) -> Notification:
    """Create a new notification for a user."""
    notification = Notification(
        user_id=user_id,
        message=message,
        type=notification_type,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_user_notifications(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    unread_only: bool = False,
) -> tuple:
    """Get notifications for a user. Returns (items, unread_count)."""
    query = db.query(Notification).filter(Notification.user_id == user_id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).count()

    items = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    return items, unread_count


def mark_notification_read(db: Session, notification_id: int, user_id: int) -> bool:
    """Mark a single notification as read. Returns True if found."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    ).first()

    if not notification:
        return False

    notification.is_read = True
    db.commit()
    return True


def mark_all_read(db: Session, user_id: int) -> int:
    """Mark all notifications for a user as read. Returns count updated."""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return count
