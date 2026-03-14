"""Authentication utilities."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import os

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token."""
    # Simplified auth - in production verify JWT properly
    token = credentials.credentials
    
    # For now, return mock user from token or env
    # In production: decode JWT and return user object
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # Mock user - replace with actual user lookup
    return {
        "id": "user_123",
        "org_id": os.getenv("DEFAULT_ORG_ID", "org_123"),
        "email": "user@example.com",
        "plan": os.getenv("DEFAULT_PLAN", "pro")
    }


async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """Get current active user."""
    return current_user
