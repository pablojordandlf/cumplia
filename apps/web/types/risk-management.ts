// types/risk-management.ts
// Risk Management System for AI Act Compliance (Article 9)

// ============================================
// RISK CATALOG (MIT AI Risk Repository)
// ============================================

export interface RiskCatalog {
  id: string;
  risk_number: number;
  name: string;
  description: string;
  domain: string;
  subdomain: string | null;
  ai_act_article: string;
  ai_act_level: 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  timing: 'pre-deployment' | 'post-deployment' | 'both';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// RISK TEMPLATES
// ============================================

export interface RiskTemplate {
  id: string;
  name: string;
  description: string | null;
  ai_act_level: 'high_risk' | 'limited_risk' | 'minimal_risk';
  is_default: boolean;
  is_system: boolean;
  organization_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskTemplateItem {
  id: string;
  template_id: string;
  catalog_risk_id: string;
  risk?: RiskCatalog; // Joined data
  is_required: boolean;
  created_at: string;
}

export interface RiskTemplateWithItems extends RiskTemplate {
  items: RiskTemplateItem[];
  risk_count: number;
}

// ============================================
// AI SYSTEM RISKS (Risk assessments per system)
// ============================================

export type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'not_applicable';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AISystemRisk {
  id: string;
  ai_system_id: string;
  catalog_risk_id: string;
  template_id: string | null;

  // Joined catalog data
  catalog_risk?: RiskCatalog;

  // Assessment
  status: RiskStatus;
  applicable: boolean; // Whether this risk applies to this AI system
  probability: RiskLevel | null;
  impact: RiskLevel | null;
  residual_risk_score: number | null;

  // Mitigation
  mitigation_measures: string | null;
  responsible_person: string | null;
  due_date: string | null;
  completed_at: string | null;

  // Metadata
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// RISK MANAGEMENT STATUS
// ============================================

export interface RiskManagementStatus {
  available: boolean;
  required: boolean;
  blocked: boolean;
  badge: 'required' | 'recommended' | 'optional' | 'blocked' | 'complete' | 'incomplete' | 'not_started';
  message: string;
  completion_percentage: number;
  total_risks: number;
  assessed_risks: number;
  mitigated_risks: number;
  critical_open: number;
  high_open: number;
}

// ============================================
// RISK MATRIX
// ============================================

export interface RiskMatrixCell {
  probability: RiskLevel;
  impact: RiskLevel;
  score: number;
  count: number;
  risks: AISystemRisk[];
  color: string;
}

// Score calculation: probability * impact mapped to 1-10 scale
export const calculateResidualRisk = (
  probability: RiskLevel | null,
  impact: RiskLevel | null
): number | null => {
  if (!probability || !impact) return null;
  
  const levels: Record<RiskLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };
  
  const score = levels[probability] * levels[impact];
  // Map 1-16 to 1-10
  if (score <= 2) return score;
  if (score <= 4) return 3;
  if (score <= 6) return 5;
  if (score <= 9) return 7;
  return 10;
};

export const getRiskLevelFromScore = (score: number): RiskLevel => {
  if (score <= 3) return 'low';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'high';
  return 'critical';
};

// ============================================
// RISK MANAGEMENT CONFIG
// ============================================

export const RISK_STATUS_CONFIG: Record<RiskStatus, { label: string; color: string; icon: string }> = {
  identified: { label: 'Identificado', color: 'bg-gray-100 text-gray-800', icon: 'circle' },
  assessed: { label: 'Evaluado', color: 'bg-blue-100 text-blue-800', icon: 'assessment' },
  mitigated: { label: 'Mitigado', color: 'bg-green-100 text-green-800', icon: 'check_circle' },
  accepted: { label: 'Aceptado', color: 'bg-yellow-100 text-yellow-800', icon: 'flag' },
  not_applicable: { label: 'No Aplicable', color: 'bg-slate-100 text-slate-800', icon: 'block' }
};

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; badgeColor: string }> = {
  low: { label: 'Bajo', color: 'text-green-600', badgeColor: 'bg-green-100 text-green-800' },
  medium: { label: 'Medio', color: 'text-yellow-600', badgeColor: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alto', color: 'text-orange-600', badgeColor: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Crítico', color: 'text-red-600', badgeColor: 'bg-red-100 text-red-800' }
};

// ============================================
// AI ACT LEVEL CONFIGURATION
// ============================================

export const AI_ACT_RISK_CONFIG: Record<string, {
  label: string;
  availability: 'required' | 'recommended' | 'optional' | 'blocked';
  description: string;
  defaultTemplateLevel: 'high_risk' | 'limited_risk' | 'minimal_risk';
}> = {
  prohibited: {
    label: 'Prohibido',
    availability: 'blocked',
    description: 'Sistemas no desplegables según AI Act',
    defaultTemplateLevel: 'high_risk'
  },
  high_risk: {
    label: 'Alto Riesgo',
    availability: 'required',
    description: 'Gestión de riesgos obligatoria (Art. 9)',
    defaultTemplateLevel: 'high_risk'
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    availability: 'recommended',
    description: 'Gestión de riesgos recomendada',
    defaultTemplateLevel: 'limited_risk'
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    availability: 'optional',
    description: 'Gestión de riesgos opcional',
    defaultTemplateLevel: 'limited_risk'
  },
  unclassified: {
    label: 'Sin clasificar',
    availability: 'optional',
    description: 'Gestión de riesgos disponible tras clasificación',
    defaultTemplateLevel: 'limited_risk'
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getRiskManagementStatus = (
  aiActLevel: string,
  risks: AISystemRisk[]
): RiskManagementStatus => {
  const config = AI_ACT_RISK_CONFIG[aiActLevel] || AI_ACT_RISK_CONFIG.unclassified;
  
  const total = risks.length;
  const assessed = risks.filter(r => r.status === 'assessed' || r.status === 'mitigated' || r.status === 'accepted').length;
  const mitigated = risks.filter(r => r.status === 'mitigated').length;
  const criticalOpen = risks.filter(r => 
    (r.status === 'identified' || r.status === 'assessed') && 
    r.catalog_risk?.criticality === 'critical'
  ).length;
  const highOpen = risks.filter(r => 
    (r.status === 'identified' || r.status === 'assessed') && 
    r.catalog_risk?.criticality === 'high'
  ).length;
  
  const completion = total > 0 ? Math.round((mitigated / total) * 100) : 0;
  
  let badge: RiskManagementStatus['badge'];
  let message: string;
  
  if (config.availability === 'blocked') {
    badge = 'blocked';
    message = 'Sistema no desplegable según AI Act';
  } else if (config.availability === 'required') {
    if (completion === 100) {
      badge = 'complete';
      message = 'Todos los riesgos han sido mitigados';
    } else if (mitigated > 0) {
      badge = 'incomplete';
      message = `${mitigated}/${total} riesgos mitigados (${criticalOpen} críticos pendientes)`;
    } else {
      badge = 'required';
      message = `Gestión de riesgos requerida: ${total} riesgos pendientes`;
    }
  } else if (config.availability === 'recommended') {
    if (mitigated > 0) {
      badge = 'complete';
      message = `${mitigated}/${total} riesgos gestionados`;
    } else if (total > 0) {
      badge = 'recommended';
      message = `${total} riesgos identificados, ${mitigated} mitigados`;
    } else {
      badge = 'recommended';
      message = 'Gestión de riesgos recomendada';
    }
  } else {
    badge = total > 0 ? 'optional' : 'not_started';
    message = total > 0 ? `${total} riesgos registrados` : 'Gestión de riesgos disponible';
  }
  
  return {
    available: config.availability !== 'blocked',
    required: config.availability === 'required',
    blocked: config.availability === 'blocked',
    badge,
    message,
    completion_percentage: completion,
    total_risks: total,
    assessed_risks: assessed,
    mitigated_risks: mitigated,
    critical_open: criticalOpen,
    high_open: highOpen
  };
};
