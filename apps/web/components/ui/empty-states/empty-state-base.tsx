import React from 'react'
import { Button } from '@/components/ui/button'
import { EmptyStateProps } from './types'

export function EmptyStateBase({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center ${className}`}
    >
      {/* Illustration */}
      {illustration && (
        <div className="mb-6 w-full max-w-xs">
          {illustration}
        </div>
      )}

      {/* Icon */}
      {icon && (
        <div className="mb-4 text-5xl opacity-80">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base text-muted-foreground max-w-md mb-6">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="lg"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
