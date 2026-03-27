'use client'

import React, { useState, useEffect } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PulseCheckmark } from './animations/pulse-checkmark'

interface FormFieldWithValidationProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  successMessage?: string
  helperText?: string
  validated?: boolean
  onValidate?: (value: string) => boolean | Promise<boolean>
}

export const FormFieldWithValidation = React.forwardRef<
  HTMLInputElement,
  FormFieldWithValidationProps
>(
  (
    {
      label,
      error,
      success,
      successMessage = 'Perfect!',
      helperText,
      validated = false,
      onValidate,
      className,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [isValidating, setIsValidating] = useState(false)
    const [isSuccess, setIsSuccess] = useState(success || false)
    const [validationError, setValidationError] = useState(error || '')

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      
      if (onValidate && e.target.value.length > 0) {
        setIsValidating(true)
        try {
          const result = await Promise.resolve(onValidate(e.target.value))
          setIsSuccess(result)
          setValidationError(result ? '' : 'This value is not valid')
        } catch (err) {
          setIsSuccess(false)
          setValidationError(err instanceof Error ? err.message : 'Validation failed')
        } finally {
          setIsValidating(false)
        }
      } else {
        setIsSuccess(false)
        setValidationError('')
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="text-sm font-medium text-foreground mb-2 block">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
              {
                'border-green-500 focus-visible:ring-green-500': isSuccess,
                'border-red-500 focus-visible:ring-red-500': validationError,
                'pr-10': isSuccess || isValidating,
              },
              className
            )}
            onChange={handleChange}
            value={value}
            {...props}
          />

          {/* Validation indicator */}
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isSuccess && !isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <PulseCheckmark size={16} duration={400} />
            </div>
          )}

          {validationError && !isSuccess && !isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="size-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Helper text */}
        {(successMessage || helperText || validationError) && (
          <p
            className={cn('text-xs mt-2', {
              'text-green-600': isSuccess,
              'text-red-600': validationError,
              'text-muted-foreground': !isSuccess && !validationError,
            })}
          >
            {isSuccess ? successMessage : validationError || helperText}
          </p>
        )}
      </div>
    )
  }
)

FormFieldWithValidation.displayName = 'FormFieldWithValidation'
