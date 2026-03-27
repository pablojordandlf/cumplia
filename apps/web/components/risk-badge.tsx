import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Shield, CheckCircle2, Clock } from "lucide-react";

interface RiskBadgeProps {
  level: 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'unclassified' | string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const riskConfig = {
  prohibited: {
    label: 'Prohibido',
    color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    icon: AlertCircle,
  },
  high_risk: {
    label: 'Alto Riesgo',
    color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
    icon: AlertTriangle,
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    icon: Shield,
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    icon: CheckCircle2,
  },
  unclassified: {
    label: 'Sin Clasificar',
    color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    icon: Clock,
  },
};

export function RiskBadge({ level, showIcon = true, size = 'md' }: RiskBadgeProps) {
  const config = riskConfig[level as keyof typeof riskConfig] || riskConfig.unclassified;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge className={`${config.color} ${sizeClasses[size]} font-medium`} variant="outline">
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
