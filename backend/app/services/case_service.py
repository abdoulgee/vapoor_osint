"""
Case management service: CRUD operations, user assignment, and strict RBAC.
"""

from typing import Optional, List
from sqlalchemy.orm import Session, joinedload

from app.models.case import Case, CaseAssignment, CaseStatus
from app.models.user import User, UserRole
from app.schemas.case import CaseCreate, CaseUpdate
from app.services.audit_service import log_action
from app.services.notification_service import create_notification
from app.services.timeline_service import log_event
from app.models.timeline import ActionType


def create_case(db: Session, case_data: CaseCreate, user: User) -> Case:
    """Create a new investigation case. Admin/Manager only."""
    case = Case(
        title=case_data.title,
        description=case_data.description,
        status=CaseStatus(case_data.status) if case_data.status else CaseStatus.OPEN,
        created_by=user.id,
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    log_action(db, user.id, "created", "case", case.id, {"title": case.title})
    log_event(db, case.id, user.id, ActionType.CASE_CREATED,
              f'Case "{case.title}" created')
    return case


def get_cases(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple:
    """Get cases visible to the current user. Strict RBAC:
    - Admin: sees all
    - Manager: sees own + assigned
    - Analyst: sees only assigned
    """
    query = db.query(Case).options(
        joinedload(Case.creator),
        joinedload(Case.assignments).joinedload(CaseAssignment.user),
    )

    if user.role == UserRole.ANALYST:
        # Analysts: only assigned cases
        query = query.join(CaseAssignment).filter(CaseAssignment.user_id == user.id)
    elif user.role == UserRole.MANAGER:
        # Managers: own cases + assigned cases
        query = query.outerjoin(CaseAssignment).filter(
            (Case.created_by == user.id) | (CaseAssignment.user_id == user.id)
        ).distinct()

    if status:
        query = query.filter(Case.status == CaseStatus(status))
    if search:
        query = query.filter(Case.title.ilike(f"%{search}%"))

    total = query.count()
    items = query.order_by(Case.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


def get_case_by_id(db: Session, case_id: int, user: User) -> Optional[Case]:
    """Get a single case by ID, respecting strict RBAC."""
    query = db.query(Case).options(
        joinedload(Case.creator),
        joinedload(Case.assignments).joinedload(CaseAssignment.user),
    ).filter(Case.id == case_id)

    case = query.first()
    if not case:
        return None

    # Enforce visibility
    if user.role == UserRole.ANALYST:
        assigned_ids = [a.user_id for a in case.assignments]
        if user.id not in assigned_ids:
            return None
    elif user.role == UserRole.MANAGER:
        assigned_ids = [a.user_id for a in case.assignments]
        if case.created_by != user.id and user.id not in assigned_ids:
            return None

    return case


def update_case(db: Session, case_id: int, case_data: CaseUpdate, user: User) -> Optional[Case]:
    """Update a case. Analysts CANNOT change status."""
    case = get_case_by_id(db, case_id, user)
    if not case:
        return None

    # Analysts cannot change case status
    if user.role == UserRole.ANALYST and case_data.status is not None:
        raise PermissionError("Analysts cannot change case status")

    old_status = case.status.value if case.status else None

    if case_data.title is not None:
        case.title = case_data.title
    if case_data.description is not None:
        case.description = case_data.description
    if case_data.status is not None:
        case.status = CaseStatus(case_data.status)

    db.commit()
    db.refresh(case)

    log_action(db, user.id, "updated", "case", case.id)

    # Log status change as timeline event
    if case_data.status and case_data.status != old_status:
        log_event(db, case.id, user.id, ActionType.STATUS_CHANGED,
                  f'Case status changed from "{old_status}" to "{case_data.status}"')

    return case


def delete_case(db: Session, case_id: int, user: User) -> bool:
    """Delete a case. Admin/Manager only — analysts CANNOT delete."""
    if user.role == UserRole.ANALYST:
        raise PermissionError("Analysts cannot delete cases")

    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return False

    # Managers can only delete their own cases
    if user.role == UserRole.MANAGER and case.created_by != user.id:
        raise PermissionError("Managers can only delete cases they created")

    db.delete(case)
    db.commit()

    log_action(db, user.id, "deleted", "case", case_id, {"title": case.title})
    return True


def assign_users(db: Session, case_id: int, user_ids: List[int], assigner: User) -> Case:
    """Assign users to a case and log timeline + notifications."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise ValueError("Case not found")

    # Only admin/manager can assign
    if assigner.role == UserRole.ANALYST:
        raise PermissionError("Analysts cannot assign users to cases")

    # Managers can only assign to their own cases
    if assigner.role == UserRole.MANAGER and case.created_by != assigner.id:
        raise PermissionError("Managers can only assign users to cases they own")

    db.query(CaseAssignment).filter(CaseAssignment.case_id == case_id).delete()

    for uid in user_ids:
        assignment = CaseAssignment(case_id=case_id, user_id=uid)
        db.add(assignment)

        if uid != assigner.id:
            create_notification(
                db, uid,
                f'You have been assigned to case "{case.title}"',
                "case_assigned", "case", case_id,
            )

    db.commit()
    db.refresh(case)

    log_action(db, assigner.id, "assigned_users", "case", case_id, {"user_ids": user_ids})
    log_event(db, case_id, assigner.id, ActionType.USER_ASSIGNED,
              f'{len(user_ids)} user(s) assigned to case')
    return case


def remove_user_from_case(db: Session, case_id: int, user_id: int, remover: User) -> bool:
    """Remove a single user from a case assignment."""
    if remover.role == UserRole.ANALYST:
        raise PermissionError("Analysts cannot modify case assignments")

    assignment = db.query(CaseAssignment).filter(
        CaseAssignment.case_id == case_id,
        CaseAssignment.user_id == user_id,
    ).first()

    if not assignment:
        return False

    db.delete(assignment)
    db.commit()

    log_action(db, remover.id, "unassigned_user", "case", case_id, {"removed_user": user_id})
    log_event(db, case_id, remover.id, ActionType.USER_UNASSIGNED,
              f'User #{user_id} removed from case')
    return True
