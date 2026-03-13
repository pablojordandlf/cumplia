from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.use_case_catalog import UseCaseCatalog
from app.core.auth import get_current_user

router = APIRouter(prefix="/catalog", tags=["catalog"])

# Schemas
class CatalogItemResponse(BaseModel):
    id: UUID
    name: str
    description: str
    sector: str
    typical_ai_act_level: str
    template_data: dict

    class Config:
        from_attributes = True

@router.get("", response_model=List[CatalogItemResponse])
def list_catalog(
    sector: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all catalog templates, optionally filtered by sector."""
    query = db.query(UseCaseCatalog)
    if sector:
        query = query.filter(UseCaseCatalog.sector == sector)
    return query.all()

@router.get("/{catalog_id}", response_model=CatalogItemResponse)
def get_catalog_item(
    catalog_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific catalog template."""
    item = db.query(UseCaseCatalog).filter(UseCaseCatalog.id == catalog_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Catalog item not found")
    return item

@router.get("/by-sector/{sector}", response_model=List[CatalogItemResponse])
def get_catalog_by_sector(
    sector: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all catalog templates for a specific sector."""
    return db.query(UseCaseCatalog).filter(UseCaseCatalog.sector == sector).all()
