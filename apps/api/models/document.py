"""Document model for storing generated compliance documents."""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base

class Document(Base):
    """Model for generated compliance documents."""
    
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    use_case_id = Column(UUID(as_uuid=True), ForeignKey("use_cases.id"), nullable=True)
    
    type = Column(String(50), nullable=False)  # ai_policy, employee_notice, etc.
    title = Column(String(255), nullable=False)
    
    # Storage paths
    pdf_path = Column(String(500), nullable=True)
    docx_path = Column(String(500), nullable=True)
    
    # Signed URLs (temporary)
    pdf_url = Column(Text, nullable=True)
    docx_url = Column(Text, nullable=True)
    
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="documents")
    use_case = relationship("UseCase", back_populates="documents")
