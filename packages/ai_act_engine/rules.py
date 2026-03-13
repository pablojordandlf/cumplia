# Classification rules for EU AI Act

# TODO: Add specific articles and obligations based on EU AI Act text.
# For now, placeholders are used.

RULES = {
    "prohibited": {
        "keywords": [
            "social scoring",
            "biometric ID in public spaces",
            "emotion recognition",
            "manipulate behavior",
            "post-cognitive manipulation",
            "predictive policing",
        ],
        "articles": ["Art. 5"],
        "obligations": ["Prohibido su uso"],
        "reason": "ProhibitedAI",
    },
    "high_risk": {
        "keywords": [
            "critical infrastructure",
            "employment",
            "education",
            "law enforcement",
            "migration",
            "justice system",
            "biometric identification", # If not in public spaces, but still sensitive
            "access to essential services",
            "credit scoring", # Often high risk
            "remote biometric identification", # If after the deadline and not for specific exceptions
        ],
        "sectors": [
            "Recursos Humanos",
            "Educación",
            "Seguridad",
            "Justicia",
            "Salud",
            "Infraestructura Crítica",
            "Servicios Financieros",
            "Gobierno",
            "Servicios Públicos",
        ],
        "articles": ["Art. 6(1)", "Art. 10"],
        "obligations": [
            "Risk management system",
            "Data governance",
            "Detailed documentation",
            "Transparency and information provision",
            "Human oversight",
            "High level of accuracy, robustness and cybersecurity",
        ],
        "reason": "HighRiskAI",
    },
    "limited_risk": {
        "keywords": [
            "chatbot",
            "chat bot",
            "deepfake",
            "synthetic media",
            "ai-generated content", # If disclosure is not made clear
            "voice assistant",
            "virtual assistant",
        ],
        "sectors": [
            "Atención al Cliente",
            "Marketing",
            "Medios",
        ],
        "articles": ["Art. 7"],
        "obligations": [
            "Transparency obligation: Users must be informed they are interacting with an AI.",
            "Disclosure of AI-generated/manipulated content."
        ],
        "reason": "LimitedRiskAI",
    },
    "minimal_risk": {
        "keywords": [
            "recommendation system",
            "spam filter",
            "video game",
            "ai-enabled video game",
            "content moderation",
            "automated data entry",
        ],
        "sectors": [
            "Comercio Electrónico",
            "Entretenimiento",
            "Publicidad",
        ],
        "articles": ["No specific articles under high risk, but general principles apply."],
        "obligations": [
            "Voluntary codes of conduct encouraged.",
            "Transparency regarding AI interaction."
        ],
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

# Define sensitivity for keywords for fuzzy matching-like behavior
# E.g., "biometric" might be high risk, but "biometrics for research" might be minimal.
# This is a simplified approach; full fuzzy matching might require more complex logic.
KEYWORD_SENSITIVITY = {
    "biometric": "high_risk",
    "emotion": "prohibited",
    "social scoring": "prohibited",
    "predictive policing": "prohibited",
    "deepfake": "limited_risk",
    "employment": "high_risk",
    "education": "high_risk",
    "justice": "high_risk",
    "law enforcement": "high_risk",
    "migration": "high_risk",
    "critical infrastructure": "high_risk",
    "chatbot": "limited_risk",
    "recommendation system": "minimal_risk",
    "spam filter": "minimal_risk",
    "video game": "minimal_risk",
}

# Sector mappings can be more granular if needed.
# This is a basic mapping.
SECTOR_RISK_MAPPING = {
    "recursos humanos": "high_risk",
    "educación": "high_risk",
    "seguridad": "high_risk",
    "justicia": "high_risk",
    "salud": "high_risk",
    "infraestructura crítica": "high_risk",
    "servicios financieros": "high_risk",
    "gobierno": "high_risk",
    "servicios públicos": "high_risk",
    "atención al cliente": "limited_risk",
    "marketing": "limited_risk",
    "medios": "limited_risk",
    "comercio electrónico": "minimal_risk",
    "entretenimiento": "minimal_risk",
    "publicidad": "minimal_risk",
    "tecnología": "unclassified", # Default for general tech sectors
    "investigación": "unclassified", # Default for research
}

# Override keywords that might appear in general descriptions but trigger prohibition
PROHIBITED_OVERRIDE_KEYWORDS = [
    "social scoring",
    "biometric id in public spaces",
    "emotion recognition",
]

# --- EU AI Act Articles and Obligations (Placeholders) ---
# This is a simplified representation. A real implementation would need to map
# these accurately to specific articles and detailed obligations.

EU_AI_ACT_DETAILS = {
    "prohibited": {
        "articles": ["Art. 5"],
        "obligations": ["Prohibited."],
    },
    "high_risk": {
        "articles": ["Art. 6(1)", "Art. 10"],
        "obligations": [
            "Risk management system",
            "Data governance and management practices",
            "Detailed technical documentation",
            "Transparency and information provision to users",
            "Human oversight measures",
            "High level of accuracy, robustness and cybersecurity",
        ],
    },
    "limited_risk": {
        "articles": ["Art. 7"],
        "obligations": [
            "Transparency obligation: Inform users they are interacting with an AI system.",
            "Disclosure of AI-generated or manipulated content (e.g., deepfakes).",
        ],
    },
    "minimal_risk": {
        "articles": ["General principles", "Voluntary codes of conduct"],
        "obligations": [
            "Encouraged to adopt voluntary codes of conduct.",
            "Transparency when interacting with users is recommended.",
        ],
    },
    "unclassified": {
        "articles": [],
        "obligations": ["Default category."],
    }
}
