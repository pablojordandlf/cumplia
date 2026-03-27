'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  contextMessage?: string
  className?: string
}

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  contextMessage,
  className = '',
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {contextMessage && (
        <p className="text-xs text-muted-foreground italic">{contextMessage}</p>
      )}
    </div>
  )
}
