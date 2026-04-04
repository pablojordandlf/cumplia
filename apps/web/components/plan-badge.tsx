import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlanBadgeProps {
  plan: 'free' | 'pro' | 'agency';
  size?: 'sm' | 'md';
}

export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const planConfig: Record<string, { label: string; className: string }> = {
    free: {
      label: 'Free',
      className: 'bg-[#E3DFD5] text-[#0B1C3D] border-[#E3DFD5] hover:bg-[#E3DFD5]/80',
    },
    pro: {
      label: 'Pro',
      className: 'bg-[#FFE8D1] text-[#0B1C3D] border-[#0B1C3D]/20 hover:bg-[#FFE8D1]/80',
    },
    agency: {
      label: 'Agency',
      className: 'bg-[#D1F0ED] text-[#8B9BB4] border-[#8B9BB4]/20 hover:bg-[#D1F0ED]/80',
    },
  };

  const config = planConfig[plan];

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
