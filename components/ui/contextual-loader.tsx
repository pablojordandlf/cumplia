'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextualLoaderProps {
  isLoading: boolean
  context?: 'analysis' | 'saving' | 'generating' | 'validating' | 'importing' | 'custom'
  customMessage?: string
  fullScreen?: boolean
  children?: React.ReactNode
}

const contextMessages: { [key: string]: string } = {
  analysis: 'Analyzing with AI...',
  saving: 'Saving your changes...',
  generating: 'Generating compliance report...',
  validating: 'Validating your input...',
  importing: 'Importing systems...',
}

export function ContextualLoader({
  isLoading,
  context = 'analysis',
  customMessage,
  fullScreen = false,
  children,
}: ContextualLoaderProps) {
  const message = customMessage || contextMessages[context] || contextMessages.analysis

  if (!isLoading) {
    return <>{children}</>
  }

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background border border-border rounded-lg p-8 shadow-lg">
          {loaderContent}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {loaderContent}
    </div>
  )
}
