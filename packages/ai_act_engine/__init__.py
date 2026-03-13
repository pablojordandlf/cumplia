
"""
Motor de clasificación de riesgo según EU AI Act.
"""
from .classifier import classify_use_case, RiskLevel

__all__ = ['classify_use_case', 'RiskLevel']
