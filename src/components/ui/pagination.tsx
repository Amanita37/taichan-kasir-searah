
import * as React from "react"
import { cn } from "@/lib/utils"

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex w-full items-center justify-center", className)}
    {...props}
  />
))
Pagination.displayName = "Pagination"

export { Pagination }
