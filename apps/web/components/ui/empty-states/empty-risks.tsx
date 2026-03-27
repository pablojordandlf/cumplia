import React from 'react'
import { Shield } from 'lucide-react'
import { EmptyStateBase } from './empty-state-base'
import { EmptyStateProps } from './types'

interface EmptyRisksProps extends Omit<EmptyStateProps, 'title' | 'description'> {
  onAssessRisks?: () => void
}

export function EmptyRisks({
  onAssessRisks,
  className = '',
  ...props
}: EmptyRisksProps) {
  return (
    <EmptyStateBase
      title="No risks identified yet"
      description="Start by running a risk assessment on your AI systems. We'll help you identify and mitigate potential compliance risks."
      icon="🛡️"
      action={
        onAssessRisks
          ? {
              label: 'Start Risk Assessment',
              onClick: onAssessRisks,
              variant: 'default',
            }
          : undefined
      }
      illustration={
        <div className="w-32 h-32 mx-auto flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <Shield size={64} className="text-green-500 opacity-60" />
        </div>
      }
      className={className}
      {...props}
    />
  )
}
