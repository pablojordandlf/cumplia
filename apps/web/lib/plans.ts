import { createClient } from '@supabase/supabase-js';

export interface PlanFeatures {
  use_cases: number;        // -1 = unlimited
  users: number;            // -1 = unlimited
  ai_check_exports: number; // -1 = unlimited
  api_access: boolean;
  integrations: boolean;
  custom_templates: boolean;
  multi_department: boolean;
  priority_support: boolean;
  sso?: boolean;
  sla?: boolean;
  dedicated_manager?: boolean;
}

export interface Plan {
  id: string;
  name: 'starter' | 'essential' | 'professional' | 'enterprise';
  display_name: string;
  price_monthly: number;
  features: PlanFeatures;
}

// New plan structure aligned with landing page
export const PLANS: Record<string, Plan> = {
  // Legacy mapping for backward compatibility
  free: {
    id: 'starter',
    name: 'starter',
    display_name: 'Starter',
    price_monthly: 0,
    features: {
      use_cases: 1,
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
      use_cases: 1,
      users: 1,
      ai_check_exports: 0,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
    },
  },
  essential: {
    id: 'essential',
    name: 'essential',
    display_name: 'Essential',
    price_monthly: 29,
    features: {
      use_cases: 5,
      users: 3,
      ai_check_exports: -1,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
    },
  },
  // Legacy pro maps to essential for backward compatibility
  pro: {
    id: 'essential',
    name: 'essential',
    display_name: 'Essential',
    price_monthly: 29,
    features: {
      use_cases: 5,
      users: 3,
      ai_check_exports: -1,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
    },
  },
  professional: {
    id: 'professional',
    name: 'professional',
    display_name: 'Professional',
    price_monthly: 99,
    features: {
      use_cases: -1,
      users: -1,
      ai_check_exports: -1,
      api_access: true,
      integrations: true,
      custom_templates: true,
      multi_department: true,
      priority_support: true,
    },
  },
  // Legacy business maps to professional
  business: {
    id: 'professional',
    name: 'professional',
    display_name: 'Professional',
    price_monthly: 99,
    features: {
      use_cases: -1,
      users: -1,
      ai_check_exports: -1,
      api_access: true,
      integrations: true,
      custom_templates: true,
      multi_department: true,
      priority_support: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    display_name: 'Enterprise',
    price_monthly: 0, // Custom pricing
    features: {
      use_cases: -1,
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
      return plan.features.use_cases === (data.use_cases || 0);
    }) || 'starter';

    return new PlanGate(planName);
  }

  getPlan(): Plan {
    return this.plan;
  }

  canCreateUseCase(currentCount: number): boolean {
    const limit = this.plan.features.use_cases;
    return limit === -1 || currentCount < limit;
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

  getUseCasesLimit(): number {
    return this.plan.features.use_cases;
  }

  getUsersLimit(): number {
    return this.plan.features.users;
  }

  isProOrHigher(): boolean {
    return ['essential', 'professional', 'enterprise'].includes(this.plan.name);
  }

  isEssentialOrHigher(): boolean {
    return ['essential', 'professional', 'enterprise'].includes(this.plan.name);
  }

  isProfessionalOrHigher(): boolean {
    return ['professional', 'enterprise'].includes(this.plan.name);
  }

  isEnterprise(): boolean {
    return this.plan.name === 'enterprise';
  }

  getUpgradeMessage(feature: string): string {
    const messages: Record<string, string> = {
      use_cases: `Has alcanzado el límite de ${this.plan.features.use_cases} casos de uso. Actualiza a Essential para gestionar hasta 5 casos de uso.`,
      api: 'El acceso a API requiere un plan Professional o superior.',
      integrations: 'Las integraciones requieren un plan Professional o superior.',
      custom_templates: 'Las plantillas personalizadas requieren un plan Professional o superior.',
      multi_department: 'La gestión multi-departamento requiere un plan Professional o superior.',
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
