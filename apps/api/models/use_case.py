
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy import Column, DateTime, String, Float, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()

class UseCase(Base):
    __tablename__ = "use_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True) # Assuming Organization model exists
    catalog_id = Column(UUID(as_uuid=True), ForeignKey("use_case_catalog.id"), nullable=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    sector = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="draft", index=True, 
                    server_default="draft", 
                    docstring="Status can be: draft, classified, in_review, compliant, non_compliant")
    ai_act_level = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=True)
    classification_reason = Column(String, nullable=True)
    classification_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True) # For soft delete

    # Optional: Define relationship if UseCaseCatalog is in the same module and Base is defined
    # catalog = relationship("UseCaseCatalog", backref="use_cases")

