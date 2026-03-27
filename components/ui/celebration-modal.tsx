'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Confetti } from './animations/confetti'
import { PulseCheckmark } from './animations/pulse-checkmark'

interface CelebrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  message?: string
  onClose?: () => void
  ctaLabel?: string
  ctaHref?: string
}

export function CelebrationModal({
  open,
  onOpenChange,
  title = 'Celebration!',
  description = 'You did it!',
  message = 'Great job completing this step.',
  onClose,
  ctaLabel = 'Continue',
  ctaHref,
}: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  const handleClose = () => {
    setShowConfetti(false)
    onClose?.()
    onOpenChange(false)
  }

  return (
    <>
      {showConfetti && <Confetti particleCount={40} duration={2500} />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <PulseCheckmark size={48} duration={800} />
            </div>
            <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-4">
            <p className="text-muted-foreground">{message}</p>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              onClick={handleClose}
              variant="default"
              size="lg"
              className="w-full"
            >
              {ctaHref ? (
                <a href={ctaHref} className="w-full">
                  {ctaLabel}
                </a>
              ) : (
                ctaLabel
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
