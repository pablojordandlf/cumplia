
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

# Assuming rules.py is in the same directory or accessible
# In a real package, this would be: from .rules import RULES, EU_AI_ACT_DETAILS
# For this context, we'll hardcode its content as it was read.

RULES = {
    "prohibited": {
        "keywords": ["social scoring", "biometric id in public spaces", "emotion recognition", "manipulate behavior", "post-cognitive manipulation", "predictive policing"],
        "sectors": [],
        "articles": ["Art. 5"],
        "obligations": ["Prohibido su uso"],
        "reason": "ProhibitedAI",
    },
    "high_risk": {
        "keywords": ["critical infrastructure", "employment", "education", "law enforcement", "migration", "justice system", "biometric identification", "access to essential services", "credit scoring", "remote biometric identification"],
        "sectors": ["recursos humanos", "educación", "seguridad", "justicia", "salud", "infraestructura crítica", "servicios financieros", "gobierno", "servicios públicos"],
        "articles": ["Art. 6(1)", "Art. 10"],
        "obligations": ["Risk management system", "Data governance", "Detailed documentation", "Transparency and information provision", "Human oversight", "High level of accuracy, robustness and cybersecurity"],
        "reason": "HighRiskAI",
    },
    "limited_risk": {
        "keywords": ["chatbot", "chat bot", "deepfake", "synthetic media", "ai-generated content", "voice assistant", "virtual assistant"],
        "sectors": ["atención al cliente", "marketing", "medios"],
        "articles": ["Art. 7"],
        "obligations": ["Transparency obligation: Users must be informed they are interacting with an AI.", "Disclosure of AI-generated/manipulated content."],
        "reason": "LimitedRiskAI",
    },
    "minimal_risk": {
        "keywords": ["recommendation system", "spam filter", "video game", "ai-enabled video game", "content moderation", "automated data entry"],
        "sectors": ["comercio electrónico", "entretenimiento", "publicidad"],
        "articles": ["No specific articles under high risk, but general principles apply."],
        "obligations": ["Voluntary codes of conduct encouraged.", "Transparency regarding AI interaction."],
        "reason": "MinimalRiskAI",
    },
    "unclassified": {
        "keywords": [],
        "sectors": [],
        "articles": [],
        "obligations": [],
        "reason": "Unclassified",
    }
}

# Lowercase all keywords for case-insensitive matching
for risk_level, data in RULES.items():
    data["keywords"] = [kw.lower() for kw in data["keywords"]]
    if "sectors" in data:
        data["sectors"] = [sector.lower() for sector in data["sectors"]]

# --- Enums and Dataclasses ---

class RiskLevel(Enum):
    PROHIBITED = "prohibited"
    HIGH_RISK = "high_risk"
    LIMITED_RISK = "limited_risk"
    MINIMAL_RISK = "minimal_risk"
    UNCLASSIFIED = "unclassified"

    def __str__(self):
        return self.value

@dataclass
class ClassificationResult:
    level: RiskLevel
    confidence: float = 0.0
    reasoning: str = ""
    articles: List[str] = None
    obligations: List[str] = None

    def __post_init__(self):
        if self.articles is None:
            self.articles = []
        if self.obligations is None:
            self.obligations = []

# --- Classification Logic ---

def _check_keywords(description: str, keywords: List[str]) -> int:
    """Counts matches of keywords in the description (case-insensitive)."""
    matches = 0
    description_lower = description.lower()
    for keyword in keywords:
        if keyword.lower() in description_lower:
            matches += 1
    return matches

def _check_sectors(sector: str, allowed_sectors: List[str]) -> bool:
    """Checks if the given sector is within the allowed sectors."""
    return sector.lower() in [s.lower() for s in allowed_sectors]

def classify_use_case(name: str, description: str, sector: str, purpose: str) -> ClassificationResult:
    """
    Classifies a use case based on EU AI Act risk levels.

    Args:
        name (str): The name of the use case.
        description (str): A detailed description of the AI system's function.
        sector (str): The sector in which the AI system operates.
        purpose (str): The intended purpose of the AI system.

    Returns:
        ClassificationResult: The classification result.
    """
    best_match_level = RiskLevel.UNCLASSIFIED
    max_score = 0
    current_reasoning = []
    found_articles: List[str] = []
    found_obligations: List[str] = []

    # Prioritize prohibited first due to strict nature
    prohibited_keywords = RULES["prohibited"]["keywords"]
    prohibited_keyword_count = _check_keywords(description, prohibited_keywords)
    if prohibited_keyword_count > 0:
        best_match_level = RiskLevel.PROHIBITED
        max_score += prohibited_keyword_count * 10  # High score for prohibited
        current_reasoning.append(f"Matched {prohibited_keyword_count} prohibited keyword(s).")
        found_articles.extend(RULES["prohibited"]["articles"])
        found_obligations.extend(RULES["prohibited"]["obligations"])

    # Then check high risk
    if best_match_level == RiskLevel.UNCLASSIFIED or best_match_level == RiskLevel.MINIMAL_RISK: # Only consider high risk if not already prohibited, or if current best is minimal (to potentially upgrade)
        high_risk_keywords = RULES["high_risk"]["keywords"]
        high_risk_sectors = RULES["high_risk"]["sectors"]
        
        keyword_matches = _check_keywords(description, high_risk_keywords)
        sector_match = _check_sectors(sector, high_risk_sectors)

        score = (keyword_matches * 5) + (5 if sector_match else 0) # Sector match gives a base score

        if score > max_score:
            max_score = score
            best_match_level = RiskLevel.HIGH_RISK
            current_reasoning = [f"Keyword matches: {keyword_matches}, Sector match: {sector_match}."]
            found_articles.extend(RULES["high_risk"]["articles"])
            found_obligations.extend(RULES["high_risk"]["obligations"])
        elif score > 0 and best_match_level == RiskLevel.UNCLASSIFIED: # If it has some high-risk indicators but not enough to override minimal, keep minimal for now
             # This part is tricky, for now we prioritize higher score, if score is same as minimal, it might stay minimal
             pass


    # Then check limited risk
    if best_match_level == RiskLevel.UNCLASSIFIED or best_match_level in [RiskLevel.MINIMAL_RISK]:
        limited_risk_keywords = RULES["limited_risk"]["keywords"]
        limited_risk_sectors = RULES["limited_risk"]["sectors"]
        
        keyword_matches = _check_keywords(description, limited_risk_keywords)
        sector_match = _check_sectors(sector, limited_risk_sectors)

        score = (keyword_matches * 3) + (3 if sector_match else 0)

        if score > max_score:
            max_score = score
            best_match_level = RiskLevel.LIMITED_RISK
            current_reasoning = [f"Keyword matches: {keyword_matches}, Sector match: {sector_match}."]
            found_articles.extend(RULES["limited_risk"]["articles"])
            found_obligations.extend(RULES["limited_risk"]["obligations"])
        elif score > 0 and best_match_level == RiskLevel.UNCLASSIFIED:
            # If matches limited risk indicators but not enough to surpass potentially minimal, keep unclassified or minimal.
            # For now, if it's unclassified or minimal and score is positive, we can tentatively assign it.
            # This logic might need refinement based on a scoring matrix.
             if best_match_level == RiskLevel.UNCLASSIFIED:
                 best_match_level = RiskLevel.LIMITED_RISK # Tentative assignment
                 current_reasoning = [f"Keyword matches: {keyword_matches}, Sector match: {sector_match}."]
                 found_articles.extend(RULES["limited_risk"]["articles"])
                 found_obligations.extend(RULES["limited_risk"]["obligations"])


    # Then check minimal risk
    if best_match_level == RiskLevel.UNCLASSIFIED: # Only consider minimal if not already classified higher
        minimal_risk_keywords = RULES["minimal_risk"]["keywords"]
        minimal_risk_sectors = RULES["minimal_risk"]["sectors"]

        keyword_matches = _check_keywords(description, minimal_risk_keywords)
        sector_match = _check_sectors(sector, minimal_risk_sectors)
        
        score = (keyword_matches * 1) + (1 if sector_match else 0)

        if score > max_score:
            max_score = score
            best_match_level = RiskLevel.MINIMAL_RISK
            current_reasoning.append(f"Keyword matches: {keyword_matches}, Sector match: {sector_match}.")
            found_articles.extend(RULES["minimal_risk"]["articles"])
            found_obligations.extend(RULES["minimal_risk"]["obligations"])
        elif score > 0: # If there are some minimal risk indicators, but it's still unclassified
            best_match_level = RiskLevel.MINIMAL_RISK # Default to minimal if any indicator found and not higher
            current_reasoning.append(f"Keyword matches: {keyword_matches}, Sector match: {sector_match}.")
            found_articles.extend(RULES["minimal_risk"]["articles"])
            found_obligations.extend(RULES["minimal_risk"]["obligations"])


    # If still unclassified and no scores, assign unclassified
    if best_match_level == RiskLevel.UNCLASSIFIED and max_score == 0:
        current_reasoning.append("No specific risk indicators found based on keywords or sectors.")
        found_articles.extend(RULES["unclassified"]["articles"])
        found_obligations.extend(RULES["unclassified"]["obligations"])
    elif best_match_level != RiskLevel.PROHIBITED and not current_reasoning:
        # This case should ideally not happen if logic above is sound, but as a fallback
        current_reasoning.append("Default to unclassified as no strong indicators were met to assign a specific risk level.")
        found_articles.extend(RULES["unclassified"]["articles"])
        found_obligations.extend(RULES["unclassified"]["obligations"])
        best_match_level = RiskLevel.UNCLASSIFIED # Ensure it's unclassified


    # Consolidate reasoning - join specific reasons with a general one if needed
    combined_reasoning = " ".join(current_reasoning)
    if not combined_reasoning:
        combined_reasoning = "Classification based on rules engine."
    
    # Special handling for 'remote biometric identification' for high risk, it might be limited if transparency is met.
    # For now, sticking to direct keyword/sector match for simplicity.

    # Ensure unique articles and obligations
    unique_articles = list(dict.fromkeys(found_articles))
    unique_obligations = list(dict.fromkeys(found_obligations))

    confidence = min(1.0, max_score / 10.0) # Simple confidence score, max 1.0

    return ClassificationResult(
        level=best_match_level,
        confidence=round(confidence, 2),
        reasoning=combined_reasoning,
        articles=unique_articles,
        obligations=unique_obligations
    )
