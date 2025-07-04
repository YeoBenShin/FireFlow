import { cn } from "@/app/_lib/utils"
import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "bg-primary/10 text-primary-foreground border-primary/30",
        variant === "secondary" && "bg-secondary/80 text-secondary-foreground border-secondary/30",
        variant === "success" && "bg-success/10 text-success-foreground border-success/30",
        variant === "warning" && "bg-warning/10 text-warning-foreground border-warning/30",
        variant === "destructive" && "bg-destructive/10 text-destructive-foreground border-destructive/30",
        variant === "outline" && "border-input bg-background",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
