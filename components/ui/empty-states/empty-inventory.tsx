import React from 'react'
import { Package } from 'lucide-react'
import { EmptyStateBase } from './empty-state-base'
import { EmptyStateProps } from './types'

interface EmptyInventoryProps extends Omit<EmptyStateProps, 'title' | 'description'> {
  onAddSystem?: () => void
}

export function EmptyInventory({
  onAddSystem,
  className = '',
  ...props
}: EmptyInventoryProps) {
  return (
    <EmptyStateBase
      title="Your inventory is empty"
      description="Let's add your first AI system. Start by documenting the systems you're using for compliance tracking."
      icon="📦"
      action={
        onAddSystem
          ? {
              label: 'Add Your First System',
              onClick: onAddSystem,
              variant: 'default',
            }
          : undefined
      }
      illustration={
        <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <Package size={64} className="text-blue-400 opacity-60" />
        </div>
      }
      className={className}
      {...props}
    />
  )
}
