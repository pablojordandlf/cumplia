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
        blue: "bg-[#E8ECEB]",
        green: "bg-[#E8F5E3]",
        orange: "bg-[#FFE8D1]",
        red: "bg-[#F4E4D7]",
        purple: "bg-[#D1F0ED]",
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
        blue: "bg-[#E09E50]",
        green: "bg-[#27A844]",
        orange: "bg-[#D97706]",
        red: "bg-[#C92A2A]",
        purple: "bg-[#8CBDB9]",
        gradient: "bg-gradient-to-r from-[#E09E50] to-[#D9885F]",
        success: "bg-gradient-to-r from-[#27A844] to-[#219639]",
        warning: "bg-gradient-to-r from-[#D97706] to-[#C86200]",
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
