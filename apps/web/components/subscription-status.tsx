"use client";

import { useState } from "react";
import { CreditCard, FileText, Server, Users, ExternalLink, Crown, Building2, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";

export function SubscriptionStatus() {
  const { permissions, checks, isLoading, refresh } = usePermissions();
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

  const getPlanBadge = (planName: string) => {
    switch (planName) {
      case "enterprise":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Crown className="h-3 w-3 mr-1" />
            Enterprise
          </Badge>
        );
      case "professional":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            <Building2 className="h-3 w-3 mr-1" />
            Professional
          </Badge>
        );
      case "essential":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Essential
          </Badge>
        );
      case "starter":
        return (
          <Badge variant="secondary">
            Starter
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Starter
          </Badge>
        );
    }
  };

  if (isLoading) {
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

  const plan = permissions?.plan;
  if (!plan || !checks) {
    return (
      <Card className="dark:bg-gray-900">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No se pudo cargar la información de suscripción</p>
          <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const useCasesPercentage = checks.getPercentage("useCases");
  const documentsPercentage = checks.getPercentage("documents");
  const usersPercentage = checks.getPercentage("users");

  const showWarning = (percentage: number) => percentage >= 80 && percentage < 100;
  const showDanger = (percentage: number) => percentage >= 100;

  return (
    <Card className="dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tu Plan</span>
          {getPlanBadge(plan.name)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Use Cases Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              <span>Sistemas de IA</span>
            </div>
            <span className="text-muted-foreground">
              {permissions.usage.useCasesUsed} / {permissions.limits.useCases === -1 ? "∞" : permissions.limits.useCases}
            </span>
          </div>
          <Progress 
            value={useCasesPercentage} 
            className={`h-2 ${showDanger(useCasesPercentage) ? 'bg-red-200' : ''}`}
          />
          {plan.name === "starter" && showWarning(useCasesPercentage) && (
            <p className="text-xs text-amber-600">
              Estás cerca del límite. Actualiza a Essential para gestionar hasta 5 sistemas.
            </p>
          )}
        </div>

        {/* Documents Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <span>Documentos</span>
            </div>
            <span className="text-muted-foreground">
              {permissions.usage.documentsUsed} / {permissions.limits.documents === -1 ? "∞" : permissions.limits.documents}
            </span>
          </div>
          <Progress 
            value={documentsPercentage} 
            className={`h-2 ${showDanger(documentsPercentage) ? 'bg-red-200' : ''}`}
          />
          {plan.name === "essential" && showWarning(documentsPercentage) && (
            <p className="text-xs text-amber-600">
              Estás cerca del límite. Actualiza a Professional para documentos ilimitados.
            </p>
          )}
        </div>

        {/* Users Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Usuarios</span>
            </div>
            <span className="text-muted-foreground">
              {permissions.usage.usersUsed} / {permissions.limits.users === -1 ? "∞" : permissions.limits.users}
            </span>
          </div>
          <Progress 
            value={usersPercentage} 
            className={`h-2 ${showDanger(usersPercentage) ? 'bg-red-200' : ''}`}
          />
        </div>

        {/* Features Summary */}
        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-gray-500 mb-2">Características incluidas:</p>
          <div className="flex flex-wrap gap-1">
            {permissions.features.friaGeneration && (
              <Badge variant="outline" className="text-xs">FRIA</Badge>
            )}
            {permissions.features.apiAccess && (
              <Badge variant="outline" className="text-xs">API</Badge>
            )}
            {permissions.features.integrations && (
              <Badge variant="outline" className="text-xs">Integraciones</Badge>
            )}
            {permissions.features.prioritySupport && (
              <Badge variant="outline" className="text-xs">Soporte prioritario</Badge>
            )}
            {permissions.features.sso && (
              <Badge variant="outline" className="text-xs">SSO</Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          {plan.name === "starter" ? (
            <Link href="/pricing" className="w-full">
              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Actualizar a Essential
              </Button>
            </Link>
          ) : plan.name === "essential" ? (
            <Link href="/pricing?plan=professional" className="w-full">
              <Button variant="outline" className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Ver Professional
              </Button>
            </Link>
          ) : plan.name === "professional" ? (
            <Link href="/pricing?plan=enterprise" className="w-full">
              <Button variant="outline" className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Ver Enterprise
              </Button>
            </Link>
          ) : null}
          
          {plan.name !== "starter" && (
            <Button
              variant="ghost"
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isPortalLoading ? "Cargando..." : "Gestionar suscripción"}
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
