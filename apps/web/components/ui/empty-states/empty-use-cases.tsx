import React from 'react'
import { Lightbulb } from 'lucide-react'
import { EmptyStateBase } from './empty-state-base'
import { EmptyStateProps } from './types'

interface EmptyUseCasesProps extends Omit<EmptyStateProps, 'title' | 'description'> {
  onCreateUseCase?: () => void
}

export function EmptyUseCases({
  onCreateUseCase,
  className = '',
  ...props
}: EmptyUseCasesProps) {
  return (
    <EmptyStateBase
      title="No use cases yet"
      description="Create your first use case to start documenting how you're using AI in your organization. This helps with AI Act compliance."
      icon="💡"
      action={
        onCreateUseCase
          ? {
              label: 'Create Use Case',
              onClick: onCreateUseCase,
              variant: 'default',
            }
          : undefined
      }
      illustration={
        <div className="w-32 h-32 mx-auto flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
          <Lightbulb size={64} className="text-amber-400 opacity-60" />
        </div>
      }
      className={className}
      {...props}
    />
  )
}
