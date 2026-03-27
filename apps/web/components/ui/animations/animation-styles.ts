import { cva } from 'class-variance-authority'

// Fade in from bottom
export const fadeInUp = cva('', {
  variants: {
    speed: {
      fast: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
      normal: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
      slow: 'animate-in fade-in slide-in-from-bottom-4 duration-700',
    },
  },
  defaultVariants: {
    speed: 'normal',
  },
})

// Slide in from right
export const slideInRight = cva('', {
  variants: {
    speed: {
      fast: 'animate-in slide-in-from-right-4 duration-300',
      normal: 'animate-in slide-in-from-right-4 duration-500',
      slow: 'animate-in slide-in-from-right-4 duration-700',
    },
  },
  defaultVariants: {
    speed: 'normal',
  },
})

// Pop scale effect
export const popScale = cva('', {
  variants: {
    speed: {
      fast: 'animate-in zoom-in-50 duration-300',
      normal: 'animate-in zoom-in-50 duration-500',
      slow: 'animate-in zoom-in-50 duration-700',
    },
  },
  defaultVariants: {
    speed: 'normal',
  },
})

// Pulse animation class
export const pulseStyle = 'animate-pulse'

// Confetti animation class (CSS defined in globals)
export const confettiStyle = 'animate-confetti'
