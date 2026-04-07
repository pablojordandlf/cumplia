import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status
from typing import Dict, Any, Optional

from core.config import settings


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase JWT token against the JWKS.
    
    Args:
        token: The JWT token from Supabase
        
    Returns:
        The decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Get the JWT secret from settings
        jwt_secret = settings.SUPABASE_JWT_SECRET
        
        if jwt_secret:
            # Use symmetric key verification
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        
        # Fallback to JWKS verification if no secret provided
        if settings.SUPABASE_URL:
            jwks_url = f"{settings.SUPABASE_URL}/.well-known/jwks.json"
            jwks_client = PyJWKClient(jwks_url)
            
            # Get the signing key
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            # Decode and verify the token
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
            return payload
        
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service not configured",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_supabase_user_id(token: str) -> Optional[str]:
    """Extract user ID from Supabase JWT token."""
    try:
        payload = verify_supabase_jwt(token)
        return payload.get("sub")
    except HTTPException:
        return None
