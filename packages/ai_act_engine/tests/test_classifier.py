"""
Tests para el motor de clasificación AI Act.
10 casos de prueba cubriendo los 4 niveles de riesgo.
"""

import pytest
from classifier import classify_use_case, RiskLevel, ClassificationResult


class TestProhibitedCases:
    """Casos de uso prohibidos según Art. 5 AI Act"""
    
    def test_social_scoring_prohibited(self):
        """Sistema de puntuación social de ciudadanos = Prohibido"""
        result = classify_use_case(
            name="Sistema de Score Social",
            description="Plataforma que asigna puntuaciones a ciudadanos basadas en comportamiento social y económico para determinar acceso a servicios públicos",
            sector="gobierno",
            purpose="Evaluación social"
        )
        assert result.level == RiskLevel.PROHIBITED
        assert "Art. 5" in result.articles
        assert result.confidence > 0.5

    def test_biometric_identification_public_spaces(self):
        """Identificación biométrica remota en espacios públicos = Prohibido"""
        result = classify_use_case(
            name="Reconocimiento Facial Ciudad",
            description="Sistema de cámaras con reconocimiento facial biométrico en tiempo real para identificar personas en espacios públicos",
            sector="seguridad",
            purpose="Vigilancia"
        )
        assert result.level == RiskLevel.PROHIBITED
        assert "Art. 5" in result.articles


class TestHighRiskCases:
    """Casos de uso de alto riesgo según Art. 6 AI Act"""
    
    def test_recruitment_system_high_risk(self):
        """Sistema de selección de personal = Alto riesgo"""
        result = classify_use_case(
            name="AI Recruiter Pro",
            description="Sistema de IA para screening de CVs, análisis de videoentrevistas y ranking automático de candidatos",
            sector="recursos humanos",
            purpose="Selección de personal"
        )
        assert result.level == RiskLevel.HIGH_RISK
        assert any("Art. 6" in art for art in result.articles)
        assert "Risk management system" in result.obligations

    def test_medical_diagnosis_high_risk(self):
        """Sistema de diagnóstico médico = Alto riesgo"""
        result = classify_use_case(
            name="MediScan AI",
            description="Sistema de inteligencia artificial para detección temprana de cáncer mediante análisis de imágenes médicas",
            sector="salud",
            purpose="Diagnóstico médico"
        )
        assert result.level == RiskLevel.HIGH_RISK
        assert result.confidence > 0.4

    def test_credit_scoring_high_risk(self):
        """Sistema de scoring crediticio = Alto riesgo"""
        result = classify_use_case(
            name="CreditScore AI",
            description="Algoritmo de machine learning para evaluar solvencia crediticia y asignar puntuaciones de riesgo financiero",
            sector="servicios financieros",
            purpose="Evaluación crediticia"
        )
        assert result.level == RiskLevel.HIGH_RISK


class TestLimitedRiskCases:
    """Casos de uso de riesgo limitado según Art. 7/50 AI Act"""
    
    def test_chatbot_limited_risk(self):
        """Chatbot de atención al cliente = Riesgo limitado"""
        result = classify_use_case(
            name="Asistente Virtual BBVA",
            description="Chatbot conversacional para atención al cliente, resolución de dudas y gestión de consultas bancarias básicas",
            sector="atención al cliente",
            purpose="Atención al cliente"
        )
        assert result.level == RiskLevel.LIMITED_RISK
        assert any("transparencia" in obl.lower() or "Transparency" in obl for obl in result.obligations)

    def test_deepfake_limited_risk(self):
        """Generador de contenido sintético = Riesgo limitado"""
        result = classify_use_case(
            name="DeepCreate Studio",
            description="Plataforma para generar videos sintéticos con avatares de IA y deepfakes para marketing y entretenimiento",
            sector="marketing",
            purpose="Generación de contenido"
        )
        assert result.level == RiskLevel.LIMITED_RISK
        assert "Art. 7" in result.articles or any("deepfake" in art.lower() for art in result.articles)


class TestMinimalRiskCases:
    """Casos de uso de riesgo mínimo"""
    
    def test_spam_filter_minimal_risk(self):
        """Filtro de spam = Riesgo mínimo"""
        result = classify_use_case(
            name="SpamGuard Pro",
            description="Sistema de filtrado automático de correos spam basado en machine learning y análisis de patrones",
            sector="tecnología",
            purpose="Filtrado de correo"
        )
        assert result.level == RiskLevel.MINIMAL_RISK

    def test_game_ai_minimal_risk(self):
        """IA para videojuegos = Riesgo mínimo"""
        result = classify_use_case(
            name="NPC AI Engine",
            description="Sistema de IA para comportamiento de personajes no jugables en videojuegos de estrategia",
            sector="entretenimiento",
            purpose="Gaming"
        )
        assert result.level == RiskLevel.MINIMAL_RISK

    def test_recommendation_system_minimal_risk(self):
        """Sistema de recomendación = Riesgo mínimo"""
        result = classify_use_case(
            name="ShopRecomender",
            description="Sistema de recomendación de productos basado en historial de compras y comportamiento de navegación",
            sector="comercio electrónico",
            purpose="Recomendación de productos"
        )
        assert result.level == RiskLevel.MINIMAL_RISK


class TestEdgeCases:
    """Casos límite y escenarios especiales"""
    
    def test_unclassified_vague_description(self):
        """Descripción vaga = No clasificado"""
        result = classify_use_case(
            name="Sistema AI Genérico",
            description="Una solución de inteligencia artificial para mejorar procesos",
            sector="tecnología",
            purpose="Optimización"
        )
        # Puede ser minimal o unclassified dependiendo de la implementación
        assert result.level in [RiskLevel.MINIMAL_RISK, RiskLevel.UNCLASSIFIED]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
