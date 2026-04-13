"""
Authentication router: register, login, refresh, and user profile endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, TokenRefresh
from app.services.auth_service import register_user, authenticate_user, generate_tokens, refresh_access_token
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. First user is auto-promoted to Admin."""
    try:
        user = register_user(db, user_data)
        tokens = generate_tokens(user)
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user=UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return JWT tokens."""
    try:
        user = authenticate_user(db, login_data)
        tokens = generate_tokens(user)
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user=UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
def refresh(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """Refresh an expired access token using a valid refresh token."""
    try:
        tokens = refresh_access_token(db, token_data.refresh_token)
        # Get user for response
        from app.core.security import decode_token
        payload = decode_token(tokens["access_token"])
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user=UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)
