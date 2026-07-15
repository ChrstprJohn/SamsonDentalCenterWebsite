import * as React from "react"
import { cn } from "@/shared/utils"

export function Marker({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center text-xs text-muted-foreground my-2",
        className
      )}
      {...props}
    />
  )
}

export function MarkerContent({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "bg-background/80 border border-border/40 rounded-full px-3 py-1 shadow-sm text-[11px]",
        className
      )}
      {...props}
    />
  )
}
