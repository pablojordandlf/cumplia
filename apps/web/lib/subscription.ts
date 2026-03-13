"use client";

import { useState, useEffect } from "react";

interface Subscription {
  plan: "free" | "pro" | "agency";
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

const PLAN_LIMITS: Record<string, { aiUses: number; documents: number }> = {
  free: { aiUses: 10, documents: 3 },
  pro: { aiUses: Infinity, documents: 50 },
  agency: { aiUses: Infinity, documents: Infinity },
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
        setSubscription(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Default to free plan on error
        setSubscription({ plan: "free", status: "active" });
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
        const subData = subRes.ok ? await subRes.json() : { subscription: { plan: "free" } };
        
        const plan = subData.subscription?.plan || "free";
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

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
          aiUsesLimit: PLAN_LIMITS.free.aiUses,
          documentsUsed: 0,
          documentsLimit: PLAN_LIMITS.free.documents,
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

  const plan = subscription?.plan || "free";

  const featureAccess: Record<string, Record<string, boolean>> = {
    documents: { free: true, pro: true, agency: true },
    ai_classification: { free: true, pro: true, agency: true },
    multiple_orgs: { free: false, pro: false, agency: true },
  };

  const canAccess = featureAccess[feature]?.[plan] ?? false;

  return { canAccess, isLoading: false };
}

export { PLAN_LIMITS };
export type { Subscription, UsageStats };
