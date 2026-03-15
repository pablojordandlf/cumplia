"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PLANS, type Plan, type PlanFeatures } from "@/lib/plans";

export interface Permissions {
  plan: Plan;
  limits: {
    useCases: number;
    documents: number;
    users: number;
  };
  features: {
    friaGeneration: boolean;
    apiAccess: boolean;
    integrations: boolean;
    customTemplates: boolean;
    multiDepartment: boolean;
    prioritySupport: boolean;
    sso: boolean;
    sla: boolean;
    dedicatedManager: boolean;
  };
  usage: {
    useCasesUsed: number;
    documentsUsed: number;
    usersUsed: number;
  };
}

export interface PermissionChecks {
  canCreateUseCase: boolean;
  canGenerateDocument: boolean;
  canInviteUser: boolean;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  getRemaining: (type: "useCases" | "documents" | "users") => number;
  getPercentage: (type: "useCases" | "documents" | "users") => number;
  isPlan: (planName: "starter" | "essential" | "professional" | "enterprise") => boolean;
  isEssentialOrHigher: boolean;
  isProfessionalOrHigher: boolean;
  isEnterprise: boolean;
}

export function usePermissions(): {
  permissions: Permissions | null;
  checks: PermissionChecks | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // Return starter plan defaults if no session
        const starterPlan = PLANS.starter;
        setPermissions({
          plan: starterPlan,
          limits: {
            useCases: starterPlan.features.use_cases,
            documents: starterPlan.features.documents,
            users: starterPlan.features.users,
          },
          features: {
            friaGeneration: starterPlan.features.fria_generation,
            apiAccess: starterPlan.features.api_access,
            integrations: starterPlan.features.integrations,
            customTemplates: starterPlan.features.custom_templates,
            multiDepartment: starterPlan.features.multi_department,
            prioritySupport: starterPlan.features.priority_support,
            sso: starterPlan.features.sso || false,
            sla: starterPlan.features.sla || false,
            dedicatedManager: starterPlan.features.dedicated_manager || false,
          },
          usage: { useCasesUsed: 0, documentsUsed: 0, usersUsed: 0 },
        });
        return;
      }

      // Fetch plan and usage from API
      const [planRes, usageRes] = await Promise.all([
        fetch("/api/v1/billing/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("/api/v1/usage", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      let planName = "starter";
      let usage = { useCasesUsed: 0, documentsUsed: 0, usersUsed: 0 };

      if (planRes.ok) {
        const planData = await planRes.json();
        // Map legacy plan names to new ones
        const planMapping: Record<string, string> = {
          'free': 'starter',
          'starter': 'starter',
          'pro': 'essential',
          'essential': 'essential',
          'business': 'professional',
          'professional': 'professional',
          'enterprise': 'enterprise',
          'agency': 'professional',
        };
        planName = planMapping[planData.plan] || planData.plan || "starter";
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        usage = {
          useCasesUsed: usageData.useCasesUsed || 0,
          documentsUsed: usageData.documentsUsed || 0,
          usersUsed: usageData.usersUsed || 0,
        };
      }

      const plan = PLANS[planName] || PLANS.starter;

      setPermissions({
        plan,
        limits: {
          useCases: plan.features.use_cases,
          documents: plan.features.documents,
          users: plan.features.users,
        },
        features: {
          friaGeneration: plan.features.fria_generation,
          apiAccess: plan.features.api_access,
          integrations: plan.features.integrations,
          customTemplates: plan.features.custom_templates,
          multiDepartment: plan.features.multi_department,
          prioritySupport: plan.features.priority_support,
          sso: plan.features.sso || false,
          sla: plan.features.sla || false,
          dedicatedManager: plan.features.dedicated_manager || false,
        },
        usage,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      // Fallback to starter plan
      const starterPlan = PLANS.starter;
      setPermissions({
        plan: starterPlan,
        limits: {
          useCases: starterPlan.features.use_cases,
          documents: starterPlan.features.documents,
          users: starterPlan.features.users,
        },
        features: {
          friaGeneration: starterPlan.features.fria_generation,
          apiAccess: starterPlan.features.api_access,
          integrations: starterPlan.features.integrations,
          customTemplates: starterPlan.features.custom_templates,
          multiDepartment: starterPlan.features.multi_department,
          prioritySupport: starterPlan.features.priority_support,
          sso: starterPlan.features.sso || false,
          sla: starterPlan.features.sla || false,
          dedicatedManager: starterPlan.features.dedicated_manager || false,
        },
        usage: { useCasesUsed: 0, documentsUsed: 0, usersUsed: 0 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Compute permission checks
  const checks: PermissionChecks | null = permissions
    ? {
        canCreateUseCase:
          permissions.limits.useCases === -1 ||
          permissions.usage.useCasesUsed < permissions.limits.useCases,
        canGenerateDocument:
          permissions.limits.documents === -1 ||
          permissions.usage.documentsUsed < permissions.limits.documents,
        canInviteUser:
          permissions.limits.users === -1 ||
          permissions.usage.usersUsed < permissions.limits.users,
        hasFeature: (feature: keyof PlanFeatures) => {
          return !!permissions.plan.features[feature];
        },
        getRemaining: (type: "useCases" | "documents" | "users") => {
          const limit = permissions.limits[type];
          const used = permissions.usage[`${type}Used` as const];
          return limit === -1 ? Infinity : Math.max(0, limit - used);
        },
        getPercentage: (type: "useCases" | "documents" | "users") => {
          const limit = permissions.limits[type];
          const used = permissions.usage[`${type}Used` as const];
          if (limit === -1) return 0;
          return Math.min((used / limit) * 100, 100);
        },
        isPlan: (planName) => permissions.plan.name === planName,
        isEssentialOrHigher: ["essential", "professional", "enterprise"].includes(permissions.plan.name),
        isProfessionalOrHigher: ["professional", "enterprise"].includes(permissions.plan.name),
        isEnterprise: permissions.plan.name === "enterprise",
      }
    : null;

  return {
    permissions,
    checks,
    isLoading,
    error,
    refresh: fetchPermissions,
  };
}

// Hook for checking a specific feature
export function useFeature(feature: keyof PlanFeatures): {
  hasAccess: boolean;
  isLoading: boolean;
  upgradeMessage: string;
} {
  const { permissions, checks, isLoading } = usePermissions();

  const upgradeMessages: Record<string, string> = {
    fria_generation: "La generación de FRIA requiere un plan Essential o superior",
    api_access: "El acceso a API requiere un plan Professional o superior",
    integrations: "Las integraciones requieren un plan Professional o superior",
    custom_templates: "Las plantillas personalizadas requieren un plan Professional o superior",
    multi_department: "La gestión multi-departamento requiere un plan Professional o superior",
    priority_support: "El soporte prioritario requiere un plan Professional o superior",
    sso: "El SSO requiere un plan Enterprise",
    sla: "El SLA garantizado requiere un plan Enterprise",
    dedicated_manager: "El Account Manager dedicado requiere un plan Enterprise",
  };

  return {
    hasAccess: checks?.hasFeature(feature) || false,
    isLoading,
    upgradeMessage: upgradeMessages[feature] || "Esta función requiere un plan superior",
  };
}

// Hook for checking usage limits
export function useLimit(type: "useCases" | "documents" | "users"): {
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
  isLoading: boolean;
  canUse: boolean;
} {
  const { permissions, checks, isLoading } = usePermissions();

  const usageKey = `${type}Used` as const;
  const used = permissions?.usage[usageKey] || 0;
  const limit = permissions?.limits[type] || 0;

  return {
    limit,
    used,
    remaining: checks?.getRemaining(type) || 0,
    percentage: checks?.getPercentage(type) || 0,
    isLoading,
    canUse: type === "useCases" 
      ? (checks?.canCreateUseCase || false)
      : type === "documents"
      ? (checks?.canGenerateDocument || false)
      : (checks?.canInviteUser || false),
  };
}
