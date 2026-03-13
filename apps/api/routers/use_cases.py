from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.models.use_case import UseCase
from app.models.use_case_catalog import UseCaseCatalog
from app.core.auth import get_current_user

router = APIRouter(prefix="/use-cases", tags=["use-cases"])

# Schemas
class UseCaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    sector: str

class UseCaseCreate(UseCaseBase):
    catalog_id: Optional[UUID] = None

class UseCaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[str] = None

class UseCaseClassification(BaseModel):
    level: str
    confidence: float
    reasoning: str
    articles: List[str]
    obligations: List[str]

class UseCaseResponse(UseCaseBase):
    id: UUID
    organization_id: UUID
    catalog_id: Optional[UUID]
    status: str
    ai_act_level: str
    confidence_score: Optional[float]
    classification_reason: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# CRUD Endpoints
@router.get("", response_model=List[UseCaseResponse])
def list_use_cases(
    sector: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    level: Optional[str] = Query(None, alias="ai_act_level"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all use cases for the current organization with optional filters."""
    query = db.query(UseCase).filter(
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    )
    
    if sector:
        query = query.filter(UseCase.sector == sector)
    if status:
        query = query.filter(UseCase.status == status)
    if level:
        query = query.filter(UseCase.ai_act_level == level)
    
    return query.order_by(UseCase.created_at.desc()).all()

@router.post("", response_model=UseCaseResponse)
def create_use_case(
    data: UseCaseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new use case."""
    use_case = UseCase(
        organization_id=current_user.organization_id,
        catalog_id=data.catalog_id,
        name=data.name,
        description=data.description,
        sector=data.sector,
        status="draft",
        ai_act_level="unclassified"
    )
    db.add(use_case)
    db.commit()
    db.refresh(use_case)
    return use_case

@router.get("/{use_case_id}", response_model=UseCaseResponse)
def get_use_case(
    use_case_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific use case by ID."""
    use_case = db.query(UseCase).filter(
        UseCase.id == use_case_id,
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    ).first()
    
    if not use_case:
        raise HTTPException(status_code=404, detail="Use case not found")
    return use_case

@router.patch("/{use_case_id}", response_model=UseCaseResponse)
def update_use_case(
    use_case_id: UUID,
    data: UseCaseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a use case."""
    use_case = db.query(UseCase).filter(
        UseCase.id == use_case_id,
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    ).first()
    
    if not use_case:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(use_case, field, value)
    
    db.commit()
    db.refresh(use_case)
    return use_case

@router.delete("/{use_case_id}")
def delete_use_case(
    use_case_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Soft delete a use case."""
    use_case = db.query(UseCase).filter(
        UseCase.id == use_case_id,
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    ).first()
    
    if not use_case:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    use_case.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Use case deleted successfully"}

# Classification Endpoint
@router.post("/{use_case_id}/classify", response_model=UseCaseResponse)
def classify_use_case(
    use_case_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Classify a use case using the AI Act engine."""
    from packages.ai_act_engine import classify_use_case as ai_classify
    
    use_case = db.query(UseCase).filter(
        UseCase.id == use_case_id,
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    ).first()
    
    if not use_case:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    # Call AI Act classifier
    result = ai_classify(
        name=use_case.name,
        description=use_case.description or "",
        sector=use_case.sector,
        purpose=""
    )
    
    # Update use case with classification
    use_case.ai_act_level = result["level"]
    use_case.confidence_score = result["confidence"]
    use_case.classification_reason = result["reasoning"]
    use_case.classification_data = result
    use_case.status = "classified"
    
    db.commit()
    db.refresh(use_case)
    return use_case
