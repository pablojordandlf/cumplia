from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, DateTime, String, Boolean, JSON, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()

class CustomFieldTemplate(Base):
    __tablename__ = "custom_field_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    field_name = Column(String, nullable=False)
    field_type = Column(String, nullable=False)  # "text", "number", "select", "date", etc.
    description = Column(String, nullable=True)
    is_required = Column(Boolean, nullable=False, default=False)
    options = Column(JSON, nullable=True)  # For select fields: ["option1", "option2", ...]
    applies_to_levels = Column(JSON, nullable=False)  # ["high_risk", "limited_risk", etc.]
    organization_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # NULL for default templates
    is_default = Column(Boolean, nullable=False, default=False, index=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_custom_field_template_org_active', 'organization_id', 'is_active'),
        Index('idx_custom_field_template_default', 'is_default', 'is_active'),
    )

    def __repr__(self):
        return f"<CustomFieldTemplate(id={self.id}, name={self.field_name}, org={self.organization_id})>"
