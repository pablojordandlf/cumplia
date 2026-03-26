import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { EmptyStateBase } from './empty-state-base'
import { EmptyStateProps } from './types'

interface EmptyComplianceProps extends Omit<EmptyStateProps, 'title' | 'description'> {
  onStartCompliance?: () => void
}

export function EmptyCompliance({
  onStartCompliance,
  className = '',
  ...props
}: EmptyComplianceProps) {
  return (
    <EmptyStateBase
      title="Ready for compliance"
      description="Great! You've completed the initial setup. Start documenting your AI compliance requirements to ensure your organization meets the AI Act standards."
      icon="✅"
      action={
        onStartCompliance
          ? {
              label: 'Begin Compliance Review',
              onClick: onStartCompliance,
              variant: 'default',
            }
          : undefined
      }
      illustration={
        <div className="w-32 h-32 mx-auto flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <CheckCircle2 size={64} className="text-purple-500 opacity-60" />
        </div>
      }
      className={className}
      {...props}
    />
  )
}
