from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import or_

from app.db.session import get_db
from app.core.auth import get_current_user
from app.models import RiskTemplate, CustomFieldTemplate

router = APIRouter(prefix="/templates", tags=["templates"])

# ==================== RISK TEMPLATES ====================

class RiskTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    applies_to_levels: List[str]  # ["high_risk", "limited_risk", etc.]

class RiskTemplateCreate(RiskTemplateBase):
    pass

class RiskTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    applies_to_levels: Optional[List[str]] = None

class RiskTemplateResponse(RiskTemplateBase):
    id: UUID
    organization_id: Optional[UUID]
    is_system: bool
    is_editable: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Risk Templates Endpoints
@router.get("/risks", response_model=List[RiskTemplateResponse])
def list_risk_templates(
    risk_level: Optional[str] = Query(None, description="Filter by applicable risk level"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    List all risk templates accessible to the current user and organization.
    
    - System templates: available to all users
    - Organization templates: available only to org members
    - Optionally filter by risk level
    """
    query = db.query(RiskTemplate).filter(
        RiskTemplate.is_active == True,
        or_(
            RiskTemplate.is_system == True,
            RiskTemplate.organization_id == current_user.organization_id
        )
    )
    
    if risk_level:
        # Filter by applicable risk levels (JSON array contains)
        query = query.filter(
            RiskTemplate.applies_to_levels.contains([risk_level])
        )
    
    return query.order_by(RiskTemplate.is_system.desc(), RiskTemplate.created_at.desc()).all()

@router.get("/risks/{template_id}", response_model=RiskTemplateResponse)
def get_risk_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific risk template if accessible to the user."""
    template = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id,
        or_(
            RiskTemplate.is_system == True,
            RiskTemplate.organization_id == current_user.organization_id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Risk template not found")
    return template

@router.post("/risks", response_model=RiskTemplateResponse)
def create_risk_template(
    data: RiskTemplateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new organization-specific risk template.
    
    - Only organization members can create custom templates
    - Templates are org-scoped automatically
    - System templates cannot be created via this endpoint
    """
    template = RiskTemplate(
        name=data.name,
        description=data.description,
        applies_to_levels=data.applies_to_levels,
        organization_id=current_user.organization_id,
        is_system=False,
        is_editable=True,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

@router.patch("/risks/{template_id}", response_model=RiskTemplateResponse)
def update_risk_template(
    template_id: UUID,
    data: RiskTemplateUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update an organization-specific risk template.
    
    - Only editable templates can be updated (is_editable=true)
    - System templates are read-only
    - User must be member of the template's organization
    """
    template = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id,
        RiskTemplate.organization_id == current_user.organization_id,
        RiskTemplate.is_editable == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Risk template not found or cannot be edited")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "applies_to_levels" and value is not None:
            template.applies_to_levels = value
        elif value is not None:
            setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    return template

@router.delete("/risks/{template_id}")
def delete_risk_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete (soft delete) an organization-specific risk template.
    
    - Only editable templates can be deleted
    - System templates are read-only
    - Marks template as inactive (is_active=false)
    """
    template = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id,
        RiskTemplate.organization_id == current_user.organization_id,
        RiskTemplate.is_editable == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Risk template not found or cannot be deleted")
    
    template.is_active = False
    template.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Risk template deleted successfully"}

@router.post("/risks/{template_id}/duplicate", response_model=RiskTemplateResponse)
def duplicate_risk_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Duplicate a risk template (system or org-scoped).
    
    - Creates a new editable copy in the user's organization
    - Preserves applies_to_levels configuration
    - Original template remains unchanged
    """
    original = db.query(RiskTemplate).filter(
        RiskTemplate.id == template_id
    ).first()
    
    if not original:
        raise HTTPException(status_code=404, detail="Risk template not found")
    
    # Verify access: system templates or user's org templates
    if not original.is_system and original.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    duplicate = RiskTemplate(
        name=f"{original.name} (copy)",
        description=original.description,
        applies_to_levels=original.applies_to_levels,
        organization_id=current_user.organization_id,
        is_system=False,
        is_editable=True,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)
    return duplicate

# ==================== CUSTOM FIELD TEMPLATES ====================

class CustomFieldBase(BaseModel):
    field_name: str
    field_type: str  # "text", "number", "select", "date", etc.
    description: Optional[str] = None
    is_required: bool = False
    options: Optional[List[str]] = None  # For select fields
    applies_to_levels: List[str]  # ["high_risk", "limited_risk", etc.]

class CustomFieldTemplateCreate(CustomFieldBase):
    pass

class CustomFieldTemplateUpdate(BaseModel):
    field_name: Optional[str] = None
    field_type: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    options: Optional[List[str]] = None
    applies_to_levels: Optional[List[str]] = None

class CustomFieldTemplateResponse(CustomFieldBase):
    id: UUID
    organization_id: Optional[UUID]
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Custom Field Templates Endpoints
@router.get("/custom-fields", response_model=List[CustomFieldTemplateResponse])
def list_custom_field_templates(
    risk_level: Optional[str] = Query(None, description="Filter by applicable risk level"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    List all custom field templates accessible to the current user and organization.
    
    - Default templates: available to all users (read-only)
    - Organization templates: available only to org members (editable)
    - Optionally filter by risk level
    """
    query = db.query(CustomFieldTemplate).filter(
        CustomFieldTemplate.is_active == True,
        or_(
            CustomFieldTemplate.is_default == True,
            CustomFieldTemplate.organization_id == current_user.organization_id
        )
    )
    
    if risk_level:
        query = query.filter(
            CustomFieldTemplate.applies_to_levels.contains([risk_level])
        )
    
    return query.order_by(
        CustomFieldTemplate.is_default.desc(),
        CustomFieldTemplate.created_at.desc()
    ).all()

@router.get("/custom-fields/{template_id}", response_model=CustomFieldTemplateResponse)
def get_custom_field_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific custom field template if accessible to the user."""
    template = db.query(CustomFieldTemplate).filter(
        CustomFieldTemplate.id == template_id,
        or_(
            CustomFieldTemplate.is_default == True,
            CustomFieldTemplate.organization_id == current_user.organization_id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Custom field template not found")
    return template

@router.post("/custom-fields", response_model=CustomFieldTemplateResponse)
def create_custom_field_template(
    data: CustomFieldTemplateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new organization-specific custom field template.
    
    - Only organization members can create custom templates
    - Templates are org-scoped automatically
    - Default templates cannot be created via this endpoint
    """
    template = CustomFieldTemplate(
        field_name=data.field_name,
        field_type=data.field_type,
        description=data.description,
        is_required=data.is_required,
        options=data.options,
        applies_to_levels=data.applies_to_levels,
        organization_id=current_user.organization_id,
        is_default=False,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

@router.patch("/custom-fields/{template_id}", response_model=CustomFieldTemplateResponse)
def update_custom_field_template(
    template_id: UUID,
    data: CustomFieldTemplateUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update an organization-specific custom field template.
    
    - Only custom (non-default) templates can be updated
    - Default templates are read-only
    - User must be member of the template's organization
    """
    template = db.query(CustomFieldTemplate).filter(
        CustomFieldTemplate.id == template_id,
        CustomFieldTemplate.organization_id == current_user.organization_id,
        CustomFieldTemplate.is_default == False
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Custom field template not found or cannot be edited")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    return template

@router.delete("/custom-fields/{template_id}")
def delete_custom_field_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete (soft delete) an organization-specific custom field template.
    
    - Only custom (non-default) templates can be deleted
    - Default templates are read-only
    - Marks template as inactive (is_active=false)
    """
    template = db.query(CustomFieldTemplate).filter(
        CustomFieldTemplate.id == template_id,
        CustomFieldTemplate.organization_id == current_user.organization_id,
        CustomFieldTemplate.is_default == False
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Custom field template not found or cannot be deleted")
    
    template.is_active = False
    template.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Custom field template deleted successfully"}

@router.post("/custom-fields/{template_id}/duplicate", response_model=CustomFieldTemplateResponse)
def duplicate_custom_field_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Duplicate a custom field template (default or org-scoped).
    
    - Creates a new custom (non-default) copy in the user's organization
    - Preserves field configuration and applies_to_levels
    - Original template remains unchanged
    """
    original = db.query(CustomFieldTemplate).filter(
        CustomFieldTemplate.id == template_id
    ).first()
    
    if not original:
        raise HTTPException(status_code=404, detail="Custom field template not found")
    
    # Verify access: default templates or user's org templates
    if not original.is_default and original.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    duplicate = CustomFieldTemplate(
        field_name=f"{original.field_name} (copy)",
        field_type=original.field_type,
        description=original.description,
        is_required=original.is_required,
        options=original.options,
        applies_to_levels=original.applies_to_levels,
        organization_id=current_user.organization_id,
        is_default=False,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)
    return duplicate
