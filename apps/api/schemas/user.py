from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from uuid import UUID

from schemas.organization import OrganizationResponse


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "member"
    onboarding_done: bool = False


class UserCreate(BaseModel):
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    sector: Optional[str] = None
    size: Optional[str] = None
    country: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    onboarding_done: Optional[bool] = None


class UserResponse(UserBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    organization: Optional[OrganizationResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
