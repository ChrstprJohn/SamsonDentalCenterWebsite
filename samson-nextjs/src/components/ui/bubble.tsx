import * as React from "react"
import { cn } from "@/shared/utils"

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted"
}

export function Bubble({ className, variant = "default", ...props }: BubbleProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-full break-words relative",
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function BubbleContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("whitespace-pre-wrap", className)} {...props} />
}

export function BubbleGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 w-full", className)} {...props} />
}

export function BubbleReactions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute -bottom-2 right-2 flex items-center justify-center bg-background border border-border shadow-sm rounded-full px-1.5 py-0.5 text-[10px] select-none",
        className
      )}
      {...props}
    />
  )
}
