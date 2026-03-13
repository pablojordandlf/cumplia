"""Seed data for use_case_catalog table.

Run this script to populate the catalog with common AI use case templates.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.use_case_catalog import UseCaseCatalog
from models.base import Base

# Catalog templates organized by sector
CATALOG_TEMPLATES = [
    # Salud
    {
        "name": "Sistema de Diagnóstico Asistido por IA",
        "description": "IA para apoyar el diagnóstico médico basado en imágenes (radiografías, resonancias, etc.)",
        "sector": "Salud",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Asistencia diagnóstica",
            "data_types": ["Imágenes médicas", "Historias clínicas"],
            "affected_subjects": ["Pacientes", "Profesionales médicos"],
            "key_articles": ["Art. 6(1)", "Art. 10", "Art. 14"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Gobernanza de datos de alta calidad",
                "Documentación técnica",
                "Supervisión humana efectiva",
                "Transparencia e información",
                "Registro en base de datos EU"
            ]
        }
    },
    {
        "name": "Chatbot de Triage Médico",
        "description": "Asistente virtual para evaluación inicial de síntomas y derivación",
        "sector": "Salud",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Triage y derivación",
            "data_types": ["Síntomas", "Datos demográficos"],
            "affected_subjects": ["Pacientes"],
            "key_articles": ["Art. 6(1)", "Art. 10"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Documentación técnica",
                "Supervisión humana"
            ]
        }
    },
    # Empleo
    {
        "name": "Sistema de Selección de Candidatos",
        "description": "IA para análisis de CVs y evaluación de candidatos en procesos de contratación",
        "sector": "Empleo",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Evaluación y selección de candidatos",
            "data_types": ["CVs", "Perfiles profesionales", "Resultados de pruebas"],
            "affected_subjects": ["Candidatos a empleo"],
            "key_articles": ["Art. 6(2)", "Art. 10", "Art. 14"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Gobernanza de datos",
                "Documentación técnica",
                "Supervisión humana efectiva",
                "Transparencia",
                "Notificación a candidatos"
            ]
        }
    },
    {
        "name": "Análisis de Desempeño Empleados",
        "description": "Sistema de evaluación continua del desempeño de empleados mediante IA",
        "sector": "Empleo",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Evaluación de desempeño",
            "data_types": ["Métricas de productividad", "Comunicaciones", "Feedback"],
            "affected_subjects": ["Empleados"],
            "key_articles": ["Art. 6(2)"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Transparencia",
                "Derecho a explicación"
            ]
        }
    },
    # Finanzas
    {
        "name": "Sistema de Detección de Fraude",
        "description": "IA para identificar transacciones fraudulentas en tiempo real",
        "sector": "Finanzas",
        "typical_ai_act_level": "limited_risk",
        "template_data": {
            "purpose": "Prevención de fraude",
            "data_types": ["Transacciones", "Patrones de comportamiento"],
            "affected_subjects": ["Clientes", "Institución financiera"],
            "key_articles": ["Art. 52"],
            "obligations": [
                "Transparencia",
                "Información a usuarios"
            ]
        }
    },
    {
        "name": "Scoring Crediticio con IA",
        "description": "Sistema de evaluación de riesgo crediticio basado en IA",
        "sector": "Finanzas",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Evaluación de riesgo crediticio",
            "data_types": ["Historial crediticio", "Datos financieros"],
            "affected_subjects": ["Solicitantes de crédito"],
            "key_articles": ["Art. 6(2)"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Gobernanza de datos",
                "Supervisión humana",
                "Derecho a explicación"
            ]
        }
    },
    # Educación
    {
        "name": "Sistema de Evaluación Educativa",
        "description": "IA para calificación de exámenes y evaluación del progreso estudiantil",
        "sector": "Educación",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Evaluación educativa",
            "data_types": ["Respuestas de exámenes", "Trabajos académicos"],
            "affected_subjects": ["Estudiantes"],
            "key_articles": ["Art. 6(2)"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Transparencia",
                "Supervisión humana"
            ]
        }
    },
    {
        "name": "Tutor Virtual Personalizado",
        "description": "Asistente de aprendizaje adaptativo para estudiantes",
        "sector": "Educación",
        "typical_ai_act_level": "minimal_risk",
        "template_data": {
            "purpose": "Apoyo educativo",
            "data_types": ["Progreso de aprendizaje", "Preferencias"],
            "affected_subjects": ["Estudiantes"],
            "key_articles": [],
            "obligations": [
                "Transparencia básica"
            ]
        }
    },
    # Justicia
    {
        "name": "Asistente de Análisis Legal",
        "description": "IA para análisis de jurisprudencia y asistencia en investigaciones",
        "sector": "Justicia",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Asistencia en investigaciones y análisis legal",
            "data_types": ["Documentos legales", "Evidencias"],
            "affected_subjects": ["Ciudadanos", "Profesionales legales"],
            "key_articles": ["Art. 6(2)"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Documentación técnica",
                "Supervisión humana obligatoria",
                "Registro en base de datos EU"
            ]
        }
    },
    # Seguridad Pública
    {
        "name": "Reconocimiento Facial en Espacios Públicos",
        "description": "Sistema de identificación biométrica en tiempo real",
        "sector": "Seguridad Pública",
        "typical_ai_act_level": "prohibited",
        "template_data": {
            "purpose": "Identificación en espacios públicos",
            "data_types": ["Imágenes faciales", "Datos biométricos"],
            "affected_subjects": ["Público general"],
            "key_articles": ["Art. 5(1)(d)"],
            "obligations": [
                "PROHIBIDO - Excepto casos específicos autorizados por ley"
            ]
        }
    },
    {
        "name": "Análisis Predictivo de Delincuencia",
        "description": "IA para predicción de actividad criminal (prohibida según AI Act)",
        "sector": "Seguridad Pública",
        "typical_ai_act_level": "prohibited",
        "template_data": {
            "purpose": "Perfilado predictivo de delincuencia",
            "data_types": ["Datos personales", "Historial"],
            "affected_subjects": ["Personas perfiladas"],
            "key_articles": ["Art. 5(1)(d)"],
            "obligations": [
                "PROHIBIDO - No puede implementarse"
            ]
        }
    },
    # Transporte
    {
        "name": "Sistema de Conducción Autónoma",
        "description": "Vehículo autónomo para transporte de pasajeros",
        "sector": "Transporte",
        "typical_ai_act_level": "high_risk",
        "template_data": {
            "purpose": "Transporte autónomo",
            "data_types": ["Datos de sensores", "Datos de navegación"],
            "affected_subjects": ["Pasajeros", "Otros usuarios de la vía"],
            "key_articles": ["Art. 6(2)"],
            "obligations": [
                "Sistema de gestión de riesgos",
                "Documentación técnica extensa",
                "Pruebas de seguridad",
                "Supervisión humana",
                "Registro en base de datos EU"
            ]
        }
    },
    # Otros
    {
        "name": "Chatbot de Atención al Cliente",
        "description": "Asistente virtual para soporte y atención al cliente",
        "sector": "Otro",
        "typical_ai_act_level": "minimal_risk",
        "template_data": {
            "purpose": "Atención al cliente",
            "data_types": ["Consultas", "Datos de contacto"],
            "affected_subjects": ["Clientes"],
            "key_articles": [],
            "obligations": [
                "Informar que es una IA"
            ]
        }
    },
    {
        "name": "Sistema de Recomendación de Productos",
        "description": "IA para personalizar recomendaciones de productos/servicios",
        "sector": "Otro",
        "typical_ai_act_level": "minimal_risk",
        "template_data": {
            "purpose": "Recomendación personalizada",
            "data_types": ["Historial de compras", "Preferencias"],
            "affected_subjects": ["Usuarios"],
            "key_articles": [],
            "obligations": [
                "Transparencia básica"
            ]
        }
    },
]


def seed_catalog():
    """Populate the use_case_catalog table with templates."""
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/cumplia')
    
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # Check if catalog already has data
        existing = session.query(UseCaseCatalog).first()
        if existing:
            print("Catalog already seeded. Skipping...")
            return
        
        # Insert templates
        for template in CATALOG_TEMPLATES:
            catalog_item = UseCaseCatalog(**template)
            session.add(catalog_item)
        
        session.commit()
        print(f"✅ Seeded {len(CATALOG_TEMPLATES)} catalog templates")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding catalog: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_catalog()
