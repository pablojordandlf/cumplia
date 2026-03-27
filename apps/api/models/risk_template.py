from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, DateTime, String, Boolean, JSON, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()

class RiskTemplate(Base):
    __tablename__ = "risk_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    applies_to_levels = Column(JSON, nullable=False)  # ["high_risk", "limited_risk", etc.]
    organization_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # NULL for system templates
    is_system = Column(Boolean, nullable=False, default=False, index=True)
    is_editable = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_risk_template_org_active', 'organization_id', 'is_active'),
        Index('idx_risk_template_system', 'is_system', 'is_active'),
    )

    def __repr__(self):
        return f"<RiskTemplate(id={self.id}, name={self.name}, org={self.organization_id})>"
