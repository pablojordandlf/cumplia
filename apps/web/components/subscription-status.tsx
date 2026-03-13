"use client";

import { useState } from "react";
import { CreditCard, FileText, Sparkles, ExternalLink, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscription, useUsageStats } from "@/lib/subscription";

export function SubscriptionStatus() {
  const { subscription, isLoading: subLoading } = useSubscription();
  const { usage, isLoading: usageLoading } = useUsageStats();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "agency":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            <Crown className="h-3 w-3 mr-1" />
            Agency
          </Badge>
        );
      case "pro":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Free
          </Badge>
        );
    }
  };

  if (subLoading || usageLoading) {
    return (
      <Card className="dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plan = subscription?.plan || "free";
  const aiUsesUsed = usage?.aiUsesUsed || 0;
  const aiUsesLimit = usage?.aiUsesLimit || 10;
  const documentsUsed = usage?.documentsUsed || 0;
  const documentsLimit = usage?.documentsLimit || 3;

  const aiUsesPercentage = Math.min((aiUsesUsed / aiUsesLimit) * 100, 100);
  const documentsPercentage = Math.min((documentsUsed / documentsLimit) * 100, 100);

  return (
    <Card className="dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Estado de Suscripción</span>
          {getPlanBadge(plan)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Usos de IA</span>
            </div>
            <span className="text-muted-foreground">
              {aiUsesUsed} / {aiUsesLimit}
            </span>
          </div>
          <Progress value={aiUsesPercentage} className="h-2" />
          {plan === "free" && aiUsesUsed >= aiUsesLimit * 0.8 && (
            <p className="text-xs text-amber-600">
              Estás cerca del límite. Considera actualizar a Pro.
            </p>
          )}
        </div>

        {/* Documents Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Documentos</span>
            </div>
            <span className="text-muted-foreground">
              {documentsUsed} / {documentsLimit}
            </span>
          </div>
          <Progress value={documentsPercentage} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {plan === "free" ? (
            <Button asChild className="flex-1">
              <a href="/pricing">
                <Crown className="h-4 w-4 mr-2" />
                Actualizar Plan
              </a>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isPortalLoading ? "Cargando..." : "Gestionar Suscripción"}
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          )}
        </div>

        {plan !== "free" && subscription?.currentPeriodEnd && (
          <p className="text-xs text-muted-foreground text-center">
            Tu suscripción se renueva el{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-ES")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
