import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PlanKey = 'free' | 'starter' | 'pro' | 'professional' | 'agency' | 'business' | 'enterprise';

interface PlanBadgeProps {
  plan: PlanKey | string;
  size?: 'sm' | 'md';
}

const PLAN_CONFIG: Record<string, { label: string; className: string }> = {
  free: {
    label: 'Evalúa',
    className: 'bg-[#E3DFD5] text-[#0B1C3D] border-[#E3DFD5] hover:bg-[#E3DFD5]/80',
  },
  starter: {
    label: 'Evalúa',
    className: 'bg-[#E3DFD5] text-[#0B1C3D] border-[#E3DFD5] hover:bg-[#E3DFD5]/80',
  },
  pro: {
    label: 'Cumple',
    className: 'bg-[#FFE8D1] text-[#0B1C3D] border-[#0B1C3D]/20 hover:bg-[#FFE8D1]/80',
  },
  professional: {
    label: 'Cumple',
    className: 'bg-[#FFE8D1] text-[#0B1C3D] border-[#0B1C3D]/20 hover:bg-[#FFE8D1]/80',
  },
  agency: {
    label: 'Protege',
    className: 'bg-[#D1F0ED] text-[#0B1C3D] border-[#8B9BB4]/20 hover:bg-[#D1F0ED]/80',
  },
  business: {
    label: 'Protege',
    className: 'bg-[#D1F0ED] text-[#0B1C3D] border-[#8B9BB4]/20 hover:bg-[#D1F0ED]/80',
  },
  enterprise: {
    label: 'Lidera',
    className: 'bg-[#0B1C3D]/10 text-[#0B1C3D] border-[#0B1C3D]/20 hover:bg-[#0B1C3D]/20',
  },
};

export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const config = PLAN_CONFIG[plan] ?? {
    label: plan,
    className: 'bg-[#E3DFD5] text-[#0B1C3D] border-[#E3DFD5] hover:bg-[#E3DFD5]/80',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        'font-medium inline-flex items-center',
        sizeClasses[size]
      )}
    >
      {config.label}
    </Badge>
  );
}
