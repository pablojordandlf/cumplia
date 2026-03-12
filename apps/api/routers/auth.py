from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from core.security import verify_supabase_jwt
from models.user import User
from models.organization import Organization
from schemas.user import UserResponse, UserCreate
from schemas.organization import OrganizationResponse

router = APIRouter(tags=["auth"])
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token."""
    token = credentials.credentials
    payload = verify_supabase_jwt(token)
    
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: no email found"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user


@router.post("/sync-user", response_model=UserResponse)
async def sync_user(
    user_data: UserCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Sync user from Supabase JWT and create organization if needed."""
    token = credentials.credentials
    payload = verify_supabase_jwt(token)
    
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: no email found"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update user info if needed
        if user_data.full_name and user.full_name != user_data.full_name:
            user.full_name = user_data.full_name
            db.commit()
            db.refresh(user)
        return user
    
    # Create new organization
    org_slug = user_data.organization_name.lower().replace(" ", "-") if user_data.organization_name else f"org-{email.split('@')[0]}"
    
    # Ensure unique slug
    existing_org = db.query(Organization).filter(Organization.slug == org_slug).first()
    if existing_org:
        import uuid
        org_slug = f"{org_slug}-{str(uuid.uuid4())[:8]}"
    
    organization = Organization(
        name=user_data.organization_name or f"Organization of {email}",
        slug=org_slug,
        sector=user_data.sector,
        size=user_data.size,
        country=user_data.country
    )
    db.add(organization)
    db.flush()  # Get organization.id
    
    # Create new user
    user = User(
        email=email,
        full_name=user_data.full_name,
        organization_id=organization.id,
        role="admin",  # First user is admin
        onboarding_done=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user
