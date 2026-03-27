from typing import List, Optional, Dict
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
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

class RiskProgressStats(BaseModel):
    """Statistics for risk progress by system"""
    use_case_id: UUID
    use_case_name: str
    ai_act_level: str
    total_risks: int
    completed_risks: int  # accepted + mitigated
    progress_percentage: int

class DashboardRiskStats(BaseModel):
    """Dashboard-wide risk statistics"""
    total_systems: int
    systems_by_level: Dict[str, int]  # prohibited, high_risk, limited_risk, minimal_risk, unclassified
    total_risks: int
    completed_risks: int  # accepted + mitigated
    accepted_risks: int
    mitigated_risks: int
    assessed_risks: int
    overall_progress_percentage: int

class RisksByLevel(BaseModel):
    """Risk counts broken down by AI Act level"""
    level: str
    total_risks: int
    completed_risks: int  # accepted + mitigated
    progress_percentage: int

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

# Dashboard & Risk Statistics Endpoints

@router.get("/stats/dashboard-risk-stats", response_model=DashboardRiskStats)
def get_dashboard_risk_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get comprehensive risk statistics for dashboard.
    Counts: total risks, completed risks (accepted + mitigated), by status.
    """
    # Get all systems for organization
    systems = db.query(UseCase).filter(
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    ).all()
    
    if not systems:
        return DashboardRiskStats(
            total_systems=0,
            systems_by_level={
                "prohibited": 0,
                "high_risk": 0,
                "limited_risk": 0,
                "minimal_risk": 0,
                "unclassified": 0
            },
            total_risks=0,
            completed_risks=0,
            accepted_risks=0,
            mitigated_risks=0,
            assessed_risks=0,
            overall_progress_percentage=0
        )
    
    system_ids = [s.id for s in systems]
    
    # Count systems by level
    systems_by_level = {
        "prohibited": len([s for s in systems if s.ai_act_level == "prohibited"]),
        "high_risk": len([s for s in systems if s.ai_act_level == "high_risk"]),
        "limited_risk": len([s for s in systems if s.ai_act_level == "limited_risk"]),
        "minimal_risk": len([s for s in systems if s.ai_act_level == "minimal_risk"]),
        "unclassified": len([s for s in systems if not s.ai_act_level or s.ai_act_level == "unclassified"])
    }
    
    # Count risks by status from ai_system_risks table
    risk_counts = db.execute(
        text("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
                COUNT(CASE WHEN status = 'mitigated' THEN 1 END) as mitigated,
                COUNT(CASE WHEN status = 'assessed' THEN 1 END) as assessed
            FROM ai_system_risks
            WHERE ai_system_id = ANY(ARRAY[:system_ids]::uuid[])
                AND status IN ('accepted', 'mitigated', 'assessed', 'identified')
        """),
        {"system_ids": system_ids}
    ).first()
    
    if risk_counts:
        total_risks = risk_counts[0] or 0
        accepted_risks = risk_counts[1] or 0
        mitigated_risks = risk_counts[2] or 0
        assessed_risks = risk_counts[3] or 0
    else:
        total_risks = accepted_risks = mitigated_risks = assessed_risks = 0
    
    completed_risks = accepted_risks + mitigated_risks
    overall_progress = (completed_risks / total_risks * 100) if total_risks > 0 else 0
    
    return DashboardRiskStats(
        total_systems=len(systems),
        systems_by_level=systems_by_level,
        total_risks=total_risks,
        completed_risks=completed_risks,
        accepted_risks=accepted_risks,
        mitigated_risks=mitigated_risks,
        assessed_risks=assessed_risks,
        overall_progress_percentage=int(overall_progress)
    )

@router.get("/stats/risk-progress", response_model=List[RiskProgressStats])
def get_risk_progress_by_system(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get risk progress statistics for each system.
    Completed = accepted + mitigated risks.
    """
    # Get all systems for organization
    systems = db.query(UseCase).filter(
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    ).all()
    
    if not systems:
        return []
    
    results = []
    for system in systems:
        # Count risks for this system
        risk_query = db.execute(
            text("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status IN ('accepted', 'mitigated') THEN 1 END) as completed
                FROM ai_system_risks
                WHERE ai_system_id = :system_id
                    AND status IN ('accepted', 'mitigated', 'assessed', 'identified')
            """),
            {"system_id": system.id}
        ).first()
        
        if risk_query:
            total = risk_query[0] or 0
            completed = risk_query[1] or 0
            percentage = (completed / total * 100) if total > 0 else 0
        else:
            total = completed = percentage = 0
        
        results.append(RiskProgressStats(
            use_case_id=system.id,
            use_case_name=system.name,
            ai_act_level=system.ai_act_level or "unclassified",
            total_risks=total,
            completed_risks=completed,
            progress_percentage=int(percentage)
        ))
    
    return results

@router.get("/stats/risks-by-level", response_model=List[RisksByLevel])
def get_risks_by_level(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get risk statistics broken down by AI Act risk level.
    Shows total and completed risks (accepted + mitigated) for each level.
    """
    # Get all systems for organization
    systems = db.query(UseCase).filter(
        UseCase.organization_id == current_user.organization_id,
        UseCase.deleted_at.is_(None)
    ).all()
    
    if not systems:
        return []
    
    system_ids = [s.id for s in systems]
    
    # Get risk counts by level using subquery
    risk_counts_query = text("""
        SELECT 
            uc.ai_act_level,
            COUNT(asr.id) as total_risks,
            COUNT(CASE WHEN asr.status IN ('accepted', 'mitigated') THEN 1 END) as completed_risks
        FROM use_cases uc
        LEFT JOIN ai_system_risks asr ON uc.id = asr.ai_system_id
        WHERE uc.id = ANY(ARRAY[:system_ids]::uuid[])
            AND uc.deleted_at IS NULL
        GROUP BY uc.ai_act_level
    """)
    
    results_raw = db.execute(risk_counts_query, {"system_ids": system_ids}).fetchall()
    
    results = []
    level_map = {
        "prohibited": "Prohibido",
        "high_risk": "Alto Riesgo",
        "limited_risk": "Limitado/Mínimo",
        "minimal_risk": "Minimal",
        "unclassified": "Sin clasificar"
    }
    
    for row in results_raw:
        if row[0]:  # if ai_act_level is not None
            level = row[0]
            total = row[1] or 0
            completed = row[2] or 0
            percentage = (completed / total * 100) if total > 0 else 0
            
            results.append(RisksByLevel(
                level=level,
                total_risks=total,
                completed_risks=completed,
                progress_percentage=int(percentage)
            ))
    
    return results
