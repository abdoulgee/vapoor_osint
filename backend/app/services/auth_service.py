"""
Authentication service: handles registration, login, token refresh.
"""

import json
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate, UserLogin


def register_user(db: Session, user_data: UserCreate) -> User:
    """Register a new user. First user becomes admin."""
    # Check for existing email
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise ValueError("Email already registered")

    # First user becomes admin
    user_count = db.query(User).count()
    role = UserRole.ADMIN if user_count == 0 else UserRole.ANALYST

    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="registered",
        entity_type="user",
        entity_id=user.id,
        details=json.dumps({"role": role.value}),
    )
    db.add(audit)
    db.commit()

    return user


def authenticate_user(db: Session, login_data: UserLogin) -> User:
    """Authenticate user credentials. Returns user or raises ValueError."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise ValueError("Invalid email or password")
    if not user.is_active:
        raise ValueError("Account is inactive")
    return user


def generate_tokens(user: User) -> dict:
    """Generate access and refresh tokens for a user."""
    token_data = {"sub": str(user.id), "role": user.role.value}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
    }


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    """Validate refresh token and issue new access token."""
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise ValueError("Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise ValueError("User not found or inactive")

    return generate_tokens(user)
