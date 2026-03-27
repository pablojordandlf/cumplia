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
      className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    },
    pro: {
      label: 'Pro',
      className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
    },
    agency: {
      label: 'Agency',
      className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
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
