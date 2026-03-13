import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, ShieldAlert, ShieldCheck, Shield, Info } from 'lucide-react';

type RiskLevelEs = 'prohibido' | 'alto' | 'limitado' | 'minimo';
type RiskLevelEn = 'prohibited' | 'high' | 'limited' | 'minimal' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'unclassified';
type RiskLevel = RiskLevelEs | RiskLevelEn;

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const riskConfig: Record<string, { label: string; className: string }> = {
  // Spanish variants
  prohibido: {
    label: 'Prohibido',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  },
  alto: {
    label: 'Alto Riesgo',
    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  },
  limitado: {
    label: 'Riesgo Limitado',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  minimo: {
    label: 'Riesgo Mínimo',
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  },
  // English variants (mapped to same styles)
  prohibited: {
    label: 'Prohibido',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  },
  high: {
    label: 'Alto Riesgo',
    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  },
  high_risk: {
    label: 'Alto Riesgo',
    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  },
  limited: {
    label: 'Riesgo Limitado',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  minimal: {
    label: 'Riesgo Mínimo',
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  },
  unclassified: {
    label: 'Sin Clasificar',
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
  },
};

export function RiskBadge({ level, className, size = 'md', showIcon = false }: RiskBadgeProps) {
  const config = riskConfig[level] || riskConfig['unclassified'];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  };
  
  const getIcon = () => {
    const normalizedLevel = level.toLowerCase();
    if (['prohibited', 'prohibido'].includes(normalizedLevel)) {
      return <ShieldAlert size={iconSize[size]} className="mr-1" />;
    }
    if (['high', 'high_risk', 'alto'].includes(normalizedLevel)) {
      return <AlertTriangle size={iconSize[size]} className="mr-1" />;
    }
    if (['limited', 'limited_risk', 'limitado'].includes(normalizedLevel)) {
      return <ShieldCheck size={iconSize[size]} className="mr-1" />;
    }
    if (['minimal', 'minimal_risk', 'minimo'].includes(normalizedLevel)) {
      return <Shield size={iconSize[size]} className="mr-1" />;
    }
    return <Info size={iconSize[size]} className="mr-1" />;
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, 'font-medium inline-flex items-center', sizeClasses[size], className)}
    >
      {showIcon && getIcon()}
      {config.label}
    </Badge>
  );
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<string, string> = {
    prohibido: 'text-red-600',
    prohibited: 'text-red-600',
    alto: 'text-amber-600',
    high: 'text-amber-600',
    high_risk: 'text-amber-600',
    limitado: 'text-green-600',
    limited: 'text-green-600',
    limited_risk: 'text-green-600',
    minimo: 'text-blue-600',
    minimal: 'text-blue-600',
    minimal_risk: 'text-blue-600',
    unclassified: 'text-gray-600',
  };
  return colors[level] || 'text-gray-600';
}

export function getRiskBgColor(level: RiskLevel): string {
  const colors: Record<string, string> = {
    prohibido: 'bg-red-50',
    prohibited: 'bg-red-50',
    alto: 'bg-amber-50',
    high: 'bg-amber-50',
    high_risk: 'bg-amber-50',
    limitado: 'bg-green-50',
    limited: 'bg-green-50',
    limited_risk: 'bg-green-50',
    minimo: 'bg-blue-50',
    minimal: 'bg-blue-50',
    minimal_risk: 'bg-blue-50',
    unclassified: 'bg-gray-50',
  };
  return colors[level] || 'bg-gray-50';
}
