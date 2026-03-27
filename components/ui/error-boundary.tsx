'use client'

import React, { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const friendlyMessages: { [key: string]: string } = {
  'Network': 'Looks like we lost connection. Let\'s try that again.',
  'NotFound': 'We can\'t find what you\'re looking for. Double-check and try again?',
  'Permission': 'You don\'t have permission to access this. Contact your admin if this seems wrong.',
  'Timeout': 'That took too long. Let\'s try again with fresh energy.',
  'default': 'Oops, something went sideways. Let\'s try that again!',
}

function getFriendlyMessage(error: Error): string {
  const message = error.message || ''
  
  if (message.includes('network') || message.includes('fetch')) {
    return friendlyMessages['Network']
  }
  if (message.includes('404') || message.includes('not found')) {
    return friendlyMessages['NotFound']
  }
  if (message.includes('403') || message.includes('permission')) {
    return friendlyMessages['Permission']
  }
  if (message.includes('timeout')) {
    return friendlyMessages['Timeout']
  }
  
  return friendlyMessages['default']
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="size-8 text-red-600" />
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              {getFriendlyMessage(this.state.error)}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-3 bg-muted rounded-md text-xs text-left overflow-auto max-w-md">
                {this.state.error.message}
              </pre>
            )}
          </div>

          <Button onClick={this.resetError} variant="default">
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
