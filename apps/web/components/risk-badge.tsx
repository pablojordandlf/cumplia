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
    color: 'bg-[#F4E4D7] text-[#C92A2A] border-[#C92A2A]/20 hover:bg-[#F4E4D7]/80',
    icon: AlertCircle,
  },
  high_risk: {
    label: 'Alto Riesgo',
    color: 'bg-[#FFE8D1] text-[#D97706] border-[#D97706]/20 hover:bg-[#FFE8D1]/80',
    icon: AlertTriangle,
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    color: 'bg-[#FFF8DC] text-[#B8860B] border-[#B8860B]/20 hover:bg-[#FFF8DC]/80',
    icon: Shield,
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    color: 'bg-[#E8F5E3] text-[#27A844] border-[#27A844]/20 hover:bg-[#E8F5E3]/80',
    icon: CheckCircle2,
  },
  unclassified: {
    label: 'Sin Clasificar',
    color: 'bg-[#E8ECEB] text-[#707070] border-[#707070]/20 hover:bg-[#E8ECEB]/80',
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
