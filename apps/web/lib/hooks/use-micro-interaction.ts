import { useCallback, useState } from 'react'

interface MicroInteractionOptions {
  duration?: number
  onComplete?: () => void
}

export function useMicroInteraction() {
  const [isAnimating, setIsAnimating] = useState(false)

  const celebrate = useCallback(
    (options: MicroInteractionOptions = {}) => {
      const { duration = 2000, onComplete } = options
      setIsAnimating(true)

      setTimeout(() => {
        setIsAnimating(false)
        onComplete?.()
      }, duration)

      return isAnimating
    },
    []
  )

  const showSuccess = useCallback(
    (duration: number = 600) => {
      return new Promise<void>((resolve) => {
        celebrate({ duration, onComplete: resolve })
      })
    },
    [celebrate]
  )

  return {
    isAnimating,
    celebrate,
    showSuccess,
  }
}

export function useFormValidation() {
  const [validationState, setValidationState] = useState<{
    [key: string]: boolean | string
  }>({})

  const setFieldValidation = useCallback(
    (field: string, isValid: boolean | string) => {
      setValidationState((prev) => ({ ...prev, [field]: isValid }))
    },
    []
  )

  const getFieldStatus = useCallback(
    (field: string): 'error' | 'success' | undefined => {
      const state = validationState[field]
      if (state === true) return 'success'
      if (state === false || typeof state === 'string') return 'error'
      return undefined
    },
    [validationState]
  )

  const isFormValid = useCallback(() => {
    return Object.values(validationState).every((v) => v === true)
  }, [validationState])

  return {
    validationState,
    setFieldValidation,
    getFieldStatus,
    isFormValid,
  }
}
