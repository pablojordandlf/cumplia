"use client";

import { useState, useEffect } from "react";

// New plan structure: starter | essential | professional | enterprise
interface Subscription {
  plan: "starter" | "essential" | "professional" | "enterprise";
  status: "active" | "canceled" | "incomplete" | "past_due";
  currentPeriodEnd?: string;
  stripeSubscriptionId?: string;
}

interface UsageStats {
  aiUsesUsed: number;
  aiUsesLimit: number;
  documentsUsed: number;
  documentsLimit: number;
}

// Plan limits aligned with new pricing
const PLAN_LIMITS: Record<string, { aiUses: number; documents: number }> = {
  starter: { aiUses: 10, documents: 0 },
  essential: { aiUses: Infinity, documents: 5 },
  professional: { aiUses: Infinity, documents: Infinity },
  enterprise: { aiUses: Infinity, documents: Infinity },
  // Legacy mappings for backward compatibility
  free: { aiUses: 10, documents: 0 },
  pro: { aiUses: Infinity, documents: 5 },
  agency: { aiUses: Infinity, documents: Infinity },
  business: { aiUses: Infinity, documents: Infinity },
};

// Helper to map legacy plan names to new ones
const mapLegacyPlan = (plan: string): string => {
  const mapping: Record<string, string> = {
    'free': 'starter',
    'pro': 'essential',
    'business': 'professional',
    'agency': 'professional',
  };
  return mapping[plan] || plan || 'starter';
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/subscription");
        if (!response.ok) {
          throw new Error("Failed to fetch subscription");
        }
        const data = await response.json();
        // Map legacy plan names
        if (data.subscription) {
          data.subscription.plan = mapLegacyPlan(data.subscription.plan);
        }
        setSubscription(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Default to starter plan on error
        setSubscription({ plan: "starter", status: "active" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  return { subscription, isLoading, error };
}

export function useUsageStats() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const [usageRes, subRes] = await Promise.all([
          fetch("/api/usage"),
          fetch("/api/subscription"),
        ]);

        if (!usageRes.ok) {
          throw new Error("Failed to fetch usage");
        }

        const usageData = await usageRes.json();
        const subData = subRes.ok ? await subRes.json() : { subscription: { plan: "starter" } };
        
        const rawPlan = subData.subscription?.plan || "starter";
        const plan = mapLegacyPlan(rawPlan);
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

        setUsage({
          aiUsesUsed: usageData.aiUsesUsed || 0,
          aiUsesLimit: limits.aiUses,
          documentsUsed: usageData.documentsUsed || 0,
          documentsLimit: limits.documents,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Default usage on error
        setUsage({
          aiUsesUsed: 0,
          aiUsesLimit: PLAN_LIMITS.starter.aiUses,
          documentsUsed: 0,
          documentsLimit: PLAN_LIMITS.starter.documents,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, []);

  return { usage, isLoading, error };
}

export function useCanAccessFeature(feature: "documents" | "ai_classification" | "multiple_orgs") {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return { canAccess: false, isLoading: true };
  }

  const plan = subscription?.plan || "starter";

  const featureAccess: Record<string, Record<string, boolean>> = {
    documents: { starter: false, essential: true, professional: true, enterprise: true },
    ai_classification: { starter: true, essential: true, professional: true, enterprise: true },
    multiple_orgs: { starter: false, essential: false, professional: true, enterprise: true },
  };

  const canAccess = featureAccess[feature]?.[plan] ?? false;

  return { canAccess, isLoading: false };
}

export { PLAN_LIMITS };
export type { Subscription, UsageStats };
