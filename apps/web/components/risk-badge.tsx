import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

// Define the available risk levels
type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';

// Define available sizes
type RiskBadgeSize = 'sm' | 'md' | 'lg';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: RiskBadgeSize;
  showIcon?: boolean;
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = false,
  className,
}) => {
  const riskConfig = {
    prohibited: {
      label: 'PROHIBIDO',
      color: 'text-red-600',
      icon: ShieldAlert,
      borderColor: 'border-l-red-600',
    },
    high: {
      label: 'ALTO RIESGO',
      color: 'text-orange-600',
      icon: AlertTriangle,
      borderColor: 'border-l-orange-600',
    },
    limited: {
      label: 'RIESGO LIMITADO',
      color: 'text-yellow-600',
      icon: AlertCircle,
      borderColor: 'border-l-yellow-600',
    },
    minimal: {
      label: 'RIESGO MÍNIMO',
      color: 'text-green-600',
      icon: CheckCircle,
      borderColor: 'border-l-green-600',
    },
    unclassified: {
      label: 'SIN CLASIFICAR',
      color: 'text-gray-500',
      icon: HelpCircle,
      borderColor: 'border-l-gray-500',
    },
  };

  const config = riskConfig[level];

  const baseStyles = `inline-flex items-center gap-1 font-semibold transition-all duration-200 ease-in-out cursor-default`;

  const sizeStyles: Record<RiskBadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSize: Record<RiskBadgeSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        config.color,
        className,
      )}
      role="status"
      aria-label={`Nivel de riesgo: ${config.label}`}
    >
      {showIcon && <IconComponent className={iconSize[size]} />}
      {config.label}
    </span>
  );
};

export default RiskBadge;
