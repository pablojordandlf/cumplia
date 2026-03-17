import { createClient } from '@supabase/supabase-js';

export interface PlanFeatures {
  ai_systems: number;        // -1 = unlimited (Sistemas de IA, no casos de uso)
  users: number;            // -1 = unlimited
  ai_check_exports: number; // -1 = unlimited
  api_access: boolean;
  integrations: boolean;
  custom_templates: boolean;
  multi_department: boolean;
  priority_support: boolean;
  ai_assistant?: boolean;      // Asistente IA
  risk_management?: boolean;   // Gestión de Riesgos
  evidence_registry?: boolean; // Registro de evidencias
  sso?: boolean;
  sla?: boolean;
  dedicated_manager?: boolean;
}

export interface Plan {
  id: string;
  name: 'starter' | 'professional' | 'business' | 'enterprise';
  display_name: string;
  price_monthly: number;
  features: PlanFeatures;
}

// Updated plan structure - March 2026
// Changed from "use_cases" to "ai_systems" to align with AI Act terminology
export const PLANS: Record<string, Plan> = {
  // Legacy mapping for backward compatibility
  free: {
    id: 'starter',
    name: 'starter',
    display_name: 'Starter',
    price_monthly: 0,
    features: {
      ai_systems: 1,
      users: 1,
      ai_check_exports: 0,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'starter',
    display_name: 'Starter',
    price_monthly: 0,
    features: {
      ai_systems: 1,
      users: 1,
      ai_check_exports: 0,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
    },
  },
  // Legacy essential maps to professional (price change from 29€ to 49€)
  essential: {
    id: 'professional',
    name: 'professional',
    display_name: 'Professional',
    price_monthly: 49,
    features: {
      ai_systems: 15,
      users: 3,
      ai_check_exports: -1,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
      evidence_registry: true,
    },
  },
  // Legacy pro maps to professional
  pro: {
    id: 'professional',
    name: 'professional',
    display_name: 'Professional',
    price_monthly: 49,
    features: {
      ai_systems: 15,
      users: 3,
      ai_check_exports: -1,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
      evidence_registry: true,
    },
  },
  professional: {
    id: 'professional',
    name: 'professional',
    display_name: 'Professional',
    price_monthly: 49,
    features: {
      ai_systems: 15,
      users: 3,
      ai_check_exports: -1,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: true,
      evidence_registry: true,
    },
  },
  // New Business tier
  business: {
    id: 'business',
    name: 'business',
    display_name: 'Business',
    price_monthly: 299,
    features: {
      ai_systems: -1, // Unlimited
      users: 10,
      ai_check_exports: -1,
      api_access: false,
      integrations: false,
      custom_templates: true,
      multi_department: true,
      priority_support: true,
      ai_assistant: true,
      risk_management: true,
      evidence_registry: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    display_name: 'Enterprise',
    price_monthly: 0, // Custom pricing
    features: {
      ai_systems: -1,
      users: -1,
      ai_check_exports: -1,
      api_access: true,
      integrations: true,
      custom_templates: true,
      multi_department: true,
      priority_support: true,
      sso: true,
      sla: true,
      dedicated_manager: true,
    },
  },
};

export class PlanGate {
  private plan: Plan;

  constructor(planName: string = 'starter') {
    this.plan = PLANS[planName] || PLANS.starter;
  }

  static async fromUser(userId: string, supabase: any): Promise<PlanGate> {
    const { data, error } = await supabase
      .rpc('get_user_plan_features', { p_user_id: userId });
    
    if (error || !data) {
      return new PlanGate('starter');
    }

    // Determine plan from features
    const planName = Object.keys(PLANS).find(key => {
      const plan = PLANS[key];
      return plan.features.ai_systems === (data.ai_systems || 0);
    }) || 'starter';

    return new PlanGate(planName);
  }

  getPlan(): Plan {
    return this.plan;
  }

  canCreateAISystem(currentCount: number): boolean {
    const limit = this.plan.features.ai_systems;
    return limit === -1 || currentCount < limit;
  }

  // Backward compatibility alias
  canCreateUseCase(currentCount: number): boolean {
    return this.canCreateAISystem(currentCount);
  }

  hasAPIAccess(): boolean {
    return this.plan.features.api_access;
  }

  hasIntegrations(): boolean {
    return this.plan.features.integrations;
  }

  hasCustomTemplates(): boolean {
    return this.plan.features.custom_templates;
  }

  hasMultiDepartment(): boolean {
    return this.plan.features.multi_department;
  }

  hasPrioritySupport(): boolean {
    return this.plan.features.priority_support;
  }

  getAISystemsLimit(): number {
    return this.plan.features.ai_systems;
  }

  // Backward compatibility alias
  getUseCasesLimit(): number {
    return this.getAISystemsLimit();
  }

  getUsersLimit(): number {
    return this.plan.features.users;
  }

  isProOrHigher(): boolean {
    return ['professional', 'business', 'enterprise'].includes(this.plan.name);
  }

  isEssentialOrHigher(): boolean {
    return ['professional', 'business', 'enterprise'].includes(this.plan.name);
  }

  isProfessionalOrHigher(): boolean {
    return ['professional', 'business', 'enterprise'].includes(this.plan.name);
  }

  isBusinessOrHigher(): boolean {
    return ['business', 'enterprise'].includes(this.plan.name);
  }

  isEnterprise(): boolean {
    return this.plan.name === 'enterprise';
  }

  getUpgradeMessage(feature: string): string {
    const messages: Record<string, string> = {
      ai_systems: `Has alcanzado el límite de ${this.plan.features.ai_systems} sistemas de IA. Actualiza a Professional para gestionar hasta 10 sistemas.`,
      use_cases: `Has alcanzado el límite de ${this.plan.features.ai_systems} sistemas de IA. Actualiza a Professional para gestionar hasta 10 sistemas.`,
      api: 'El acceso a API requiere un plan Business o superior.',
      integrations: 'Las integraciones requieren un plan Business o superior.',
      custom_templates: 'Las plantillas personalizadas requieren un plan Business o superior.',
      multi_department: 'La gestión multi-departamento requiere un plan Business o superior.',
    };
    return messages[feature] || 'Esta función requiere un plan superior.';
  }
}

// Utility hook for React components
export function usePlanGate(planName: string) {
  return new PlanGate(planName);
}

// Server-side plan checking
export async function checkPlanLimit(
  userId: string,
  limitName: keyof PlanFeatures,
  currentCount: number,
  supabase: any
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_plan_limit', {
      p_user_id: userId,
      p_limit_name: limitName,
      p_current_count: currentCount,
    });
  
  if (error) {
    console.error('Error checking plan limit:', error);
    return false;
  }
  
  return data === true;
}
