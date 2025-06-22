import { cn } from "@/app/_lib/utils"

import * as React from "react"

const Label = React.forwardRef<HTMLLabelElement, React.HTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Label.displayName = "Label"

export { Label }
