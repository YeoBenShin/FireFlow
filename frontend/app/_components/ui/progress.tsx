import * as React from "react"

import { cn } from "@/app/_lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLProgressElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(({ className, value, max, ...props }, ref) => {
  return (
    <progress
      ref={ref}
      className={cn("peer h-2 w-full appearance-none overflow-hidden rounded-full bg-secondary", className)}
      value={value}
      max={max}
      {...props}
    >
      <div className="relative h-full w-full bg-card">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all"
          style={{ width: `${((value ?? 0) * 100) / (max ?? 100)}%` }}
        />
      </div>
    </progress>
  )
})
Progress.displayName = "Progress"

export { Progress }
