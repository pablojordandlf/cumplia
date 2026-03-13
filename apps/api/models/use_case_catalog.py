
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy import Column, DateTime, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class UseCaseCatalog(Base):
    __tablename__ = "use_case_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    sector = Column(String, nullable=False, index=True)
    default_risk_level = Column(String, nullable=False)
    obligations = Column(JSON, default=lambda: {})
    article_references = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
