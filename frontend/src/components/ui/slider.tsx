"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0], min = 0, max = 100, step = 1, onValueChange, disabled, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setLocalValue(value)
    }, [value])

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return

      const slider = sliderRef.current
      if (!slider) return

      const rect = slider.getBoundingClientRect()
      const percentage = (event.clientX - rect.left) / rect.width
      const newValue = Math.round((min + percentage * (max - min)) / step) * step
      const clampedValue = Math.max(min, Math.min(max, newValue))
      
      const newValues = [clampedValue]
      setLocalValue(newValues)
      onValueChange?.(newValues)
    }

    const percentage = ((localValue[0] - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20 cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }