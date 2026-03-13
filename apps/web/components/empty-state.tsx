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
  title = 'No hay casos de uso',
  description = 'Comienza creando tu primer caso de uso de IA para clasificarlo según el AI Act Europeo.',
  actionLabel = 'Crear caso de uso',
  onAction,
  className,
}) => {
  return (
    <div className={cn('text-center py-16 px-4', className)}>
      <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700 text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
