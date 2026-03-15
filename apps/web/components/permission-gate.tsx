"use client";

import React from "react";
import { usePermissions, type PermissionChecks } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Crown, Building2 } from "lucide-react";
import Link from "next/link";

interface PermissionGateProps {
  children: React.ReactNode;
  check: (checks: PermissionChecks) => boolean;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export function PermissionGate({
  children,
  check,
  fallback,
  loading,
}: PermissionGateProps) {
  const { checks, isLoading } = usePermissions();

  if (isLoading) {
    return loading || <PermissionGateSkeleton />;
  }

  if (!checks || !check(checks)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Pre-built gates for common scenarios
interface FeatureGateProps {
  children: React.ReactNode;
  feature: keyof PermissionChecks["hasFeature"] extends (arg: infer P) => boolean ? P : never;
  fallback?: React.ReactNode;
}

export function FeatureGate({ children, feature, fallback }: FeatureGateProps) {
  return (
    <PermissionGate
      check={(checks) => checks.hasFeature(feature as any)}
      fallback={fallback || <FeatureFallback feature={feature as string} />}
    >
      {children}
    </PermissionGate>
  );
}

interface PlanGateProps {
  children: React.ReactNode;
  minPlan: "free" | "pro" | "business" | "enterprise";
  fallback?: React.ReactNode;
}

export function PlanGate({ children, minPlan, fallback }: PlanGateProps) {
  const planHierarchy = ["free", "pro", "business", "enterprise"];
  
  return (
    <PermissionGate
      check={(checks) => {
        const currentIndex = planHierarchy.indexOf(
          checks.isPlan("enterprise") ? "enterprise" :
          checks.isPlan("business") ? "business" :
          checks.isPlan("pro") ? "pro" : "free"
        );
        const minIndex = planHierarchy.indexOf(minPlan);
        return currentIndex >= minIndex;
      }}
      fallback={fallback || <PlanFallback minPlan={minPlan} />}
    >
      {children}
    </PermissionGate>
  );
}

// Fallback components
function PermissionGateSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-muted rounded w-1/3"></div>
      <div className="h-8 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
    </div>
  );
}

function FeatureFallback({ feature }: { feature: string }) {
  const featureLabels: Record<string, { title: string; description: string; plan: string }> = {
    fria_generation: {
      title: "FRIA - Evaluación de Impacto",
      description: "Genera evaluaciones de impacto en derechos fundamentales conforme al Art. 27 del AI Act.",
      plan: "PRO",
    },
    api_access: {
      title: "Acceso API",
      description: "Integra CumplIA con tus sistemas mediante nuestra API REST.",
      plan: "Business",
    },
    integrations: {
      title: "Integraciones",
      description: "Conecta con Slack, Microsoft Teams y otras herramientas.",
      plan: "Business",
    },
    custom_templates: {
      title: "Plantillas Personalizadas",
      description: "Crea y personaliza plantillas de documentos para tu organización.",
      plan: "Business",
    },
    multi_department: {
      title: "Multi-departamento",
      description: "Gestiona múltiples departamentos y equipos desde una cuenta.",
      plan: "Business",
    },
    priority_support: {
      title: "Soporte Prioritario",
      description: "Obtén respuesta prioritaria de nuestro equipo de soporte.",
      plan: "Business",
    },
    sso: {
      title: "Single Sign-On (SSO)",
      description: "Autenticación mediante SAML 2.0 y proveedores de identidad corporativos.",
      plan: "Enterprise",
    },
    sla: {
      title: "SLA Garantizado",
      description: "Acuerdo de nivel de servicio con disponibilidad garantizada del 99.9%.",
      plan: "Enterprise",
    },
    dedicated_manager: {
      title: "Account Manager Dedicado",
      description: "Gestor de cuenta exclusivo para tu organización.",
      plan: "Enterprise",
    },
  };

  const info = featureLabels[feature] || {
    title: "Función Premium",
    description: "Esta función requiere un plan superior.",
    plan: "PRO",
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{info.description}</p>
        <Link href={`/pricing?plan=${info.plan.toLowerCase()}`}>
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Actualizar a {info.plan}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function PlanFallback({ minPlan }: { minPlan: string }) {
  const planInfo: Record<string, { icon: React.ReactNode; color: string }> = {
    pro: { icon: <Sparkles className="w-6 h-6" />, color: "text-blue-600" },
    business: { icon: <Building2 className="w-6 h-6" />, color: "text-purple-600" },
    enterprise: { icon: <Crown className="w-6 h-6" />, color: "text-amber-600" },
  };

  const info = planInfo[minPlan] || planInfo.pro;

  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center">
        <div className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 ${info.color}`}>
          {info.icon}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Requiere plan {minPlan.charAt(0).toUpperCase() + minPlan.slice(1)}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Esta sección requiere una suscripción {minPlan} o superior.
        </p>
        <Link href={`/pricing?plan=${minPlan}`}>
          <Button>Ver planes {minPlan}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Limit-based gate
interface LimitGateProps {
  children: React.ReactNode;
  type: "useCases" | "documents" | "users";
  fallback?: React.ReactNode;
}

export function LimitGate({ children, type, fallback }: LimitGateProps) {
  const checkName = type === "useCases" 
    ? "canCreateUseCase" 
    : type === "documents" 
    ? "canGenerateDocument" 
    : "canInviteUser";

  const labels: Record<string, { title: string; description: string }> = {
    useCases: {
      title: "Límite de sistemas alcanzado",
      description: "Has alcanzado el número máximo de sistemas de IA permitidos en tu plan.",
    },
    documents: {
      title: "Límite de documentos alcanzado",
      description: "Has alcanzado el número máximo de documentos permitidos en tu plan.",
    },
    users: {
      title: "Límite de usuarios alcanzado",
      description: "Has alcanzado el número máximo de usuarios permitidos en tu plan.",
    },
  };

  const info = labels[type];

  return (
    <PermissionGate
      check={(checks) => checks[checkName as keyof PermissionChecks] as boolean}
      fallback={fallback || (
        <Card className="border-dashed border-red-200 bg-red-50/50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{info.description}</p>
            <Link href="/pricing">
              <Button variant="outline">Explorar planes superiores</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </PermissionGate>
  );
}
