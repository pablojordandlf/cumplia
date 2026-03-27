import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No hay sistemas de IA',
  description = 'Comienza creando tu primer sistema de IA de IA para clasificarlo según el AI Act Europeo.',
  actionLabel = 'Crear sistema de IA',
  onAction,
  className,
}) => {
  return (
    <div className={cn('text-center py-16 px-4', className)}>
      <FolderOpen className="w-16 h-16 text-[#E8ECEB] mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-[#2D3E4E] mb-2">{title}</h3>
      <p className="text-[#7a8a92] max-w-md mx-auto mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction} className="bg-[#E09E50] hover:bg-[#D9885F] text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
