import { createClient } from '@supabase/supabase-js';

export interface PlanFeatures {
  use_cases: number;        // -1 = unlimited
  documents: number;        // -1 = unlimited
  users: number;            // -1 = unlimited
  ai_check_exports: number; // -1 = unlimited
  fria_generation: boolean;
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
  name: 'free' | 'pro' | 'business' | 'enterprise';
  display_name: string;
  price_monthly: number;
  features: PlanFeatures;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'free',
    display_name: 'Free',
    price_monthly: 0,
    features: {
      use_cases: 1,
      documents: 0,
      users: 1,
      ai_check_exports: 0,
      fria_generation: false,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'pro',
    display_name: 'PRO',
    price_monthly: 99,
    features: {
      use_cases: 5,
      documents: 10,
      users: 3,
      ai_check_exports: -1,
      fria_generation: true,
      api_access: false,
      integrations: false,
      custom_templates: false,
      multi_department: false,
      priority_support: false,
    },
  },
  business: {
    id: 'business',
    name: 'business',
    display_name: 'Business',
    price_monthly: 239,
    features: {
      use_cases: 15,
      documents: -1,
      users: 10,
      ai_check_exports: -1,
      fria_generation: true,
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
      documents: -1,
      users: -1,
      ai_check_exports: -1,
      fria_generation: true,
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

  constructor(planName: string = 'free') {
    this.plan = PLANS[planName] || PLANS.free;
  }

  static async fromUser(userId: string, supabase: any): Promise<PlanGate> {
    const { data, error } = await supabase
      .rpc('get_user_plan_features', { p_user_id: userId });
    
    if (error || !data) {
      return new PlanGate('free');
    }

    // Determine plan from features
    const planName = Object.keys(PLANS).find(key => {
      const plan = PLANS[key];
      return plan.features.use_cases === (data.use_cases || 0);
    }) || 'free';

    return new PlanGate(planName);
  }

  getPlan(): Plan {
    return this.plan;
  }

  canCreateUseCase(currentCount: number): boolean {
    const limit = this.plan.features.use_cases;
    return limit === -1 || currentCount < limit;
  }

  canGenerateDocument(currentCount: number): boolean {
    const limit = this.plan.features.documents;
    return limit === -1 || currentCount < limit;
  }

  canGenerateFRIA(): boolean {
    return this.plan.features.fria_generation;
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

  getDocumentsLimit(): number {
    return this.plan.features.documents;
  }

  getUsersLimit(): number {
    return this.plan.features.users;
  }

  isProOrHigher(): boolean {
    return ['pro', 'business', 'enterprise'].includes(this.plan.name);
  }

  isBusinessOrHigher(): boolean {
    return ['business', 'enterprise'].includes(this.plan.name);
  }

  isEnterprise(): boolean {
    return this.plan.name === 'enterprise';
  }

  getUpgradeMessage(feature: string): string {
    const messages: Record<string, string> = {
      use_cases: `Has alcanzado el límite de ${this.plan.features.use_cases} casos de uso. Actualiza a Essential para gestionar hasta 5 casos de uso.`,
      documents: `Has alcanzado el límite de ${this.plan.features.documents} documentos. Actualiza a Professional para documentación ilimitada.`,
      fria: 'La generación de FRIA completa requiere un plan Essential o superior.',
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
