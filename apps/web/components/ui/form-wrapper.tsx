'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormWrapperProps {
  title: string
  description?: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitLabel?: string
  submitLoading?: boolean
  submitDisabled?: boolean
  children: React.ReactNode
  cancelLabel?: string
  onCancel?: () => void
  className?: string
  layout?: 'card' | 'inline'
}

export function FormWrapper({
  title,
  description,
  onSubmit,
  submitLabel = 'Save Changes',
  submitLoading = false,
  submitDisabled = false,
  children,
  cancelLabel = 'Cancel',
  onCancel,
  className = '',
  layout = 'card',
}: FormWrapperProps) {
  if (layout === 'inline') {
    return (
      <form onSubmit={onSubmit} className={cn('w-full', className)}>
        {children}
        <div className="flex gap-2 mt-6 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={submitDisabled || submitLoading}>
            {submitLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
          <div className="flex gap-2 justify-end pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            <Button type="submit" disabled={submitDisabled || submitLoading}>
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
