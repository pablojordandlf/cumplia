import React from 'react'
import { Check } from 'lucide-react'
import { AnimationProps } from './types'

interface PulseCheckmarkProps extends AnimationProps {
  size?: number
  className?: string
}

export function PulseCheckmark({
  size = 24,
  duration = 600,
  className = '',
  onComplete,
}: PulseCheckmarkProps) {
  React.useEffect(() => {
    if (onComplete && duration > 0) {
      const timer = setTimeout(onComplete, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onComplete])

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes pulse-pop {
          0% {
            opacity: 1;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .checkmark-pulse {
          animation: pulse-pop ${duration}ms ease-out 1;
        }
      `}</style>
      <div className="checkmark-pulse">
        <Check
          size={size}
          className="text-green-500 stroke-[3]"
          strokeWidth={3}
        />
      </div>
    </div>
  )
}
