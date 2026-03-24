"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const trackVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full",
  {
    variants: {
      trackVariant: {
        default: "bg-secondary",
        blue: "bg-blue-100",
        green: "bg-green-100",
        orange: "bg-orange-100",
        red: "bg-red-100",
        purple: "bg-purple-100",
      },
    },
    defaultVariants: {
      trackVariant: "default",
    },
  }
)

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      indicatorVariant: {
        default: "bg-primary",
        blue: "bg-blue-500",
        green: "bg-green-500",
        orange: "bg-orange-500",
        red: "bg-red-500",
        purple: "bg-purple-500",
        gradient: "bg-gradient-to-r from-blue-500 to-indigo-600",
        success: "bg-gradient-to-r from-green-500 to-emerald-600",
        warning: "bg-gradient-to-r from-orange-500 to-amber-600",
      },
    },
    defaultVariants: {
      indicatorVariant: "default",
    },
  }
)

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  trackVariant?: VariantProps<typeof trackVariants>["trackVariant"]
  indicatorVariant?: VariantProps<typeof indicatorVariants>["indicatorVariant"]
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, trackVariant, indicatorVariant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(trackVariants({ trackVariant }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(indicatorVariants({ indicatorVariant }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, trackVariants, indicatorVariants }
export type { ProgressProps }
