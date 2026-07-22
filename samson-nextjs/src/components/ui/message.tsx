import * as React from "react"
import { cn } from "@/shared/utils"

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
}

export function Message({ className, align = "start", ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-3 items-end",
        align === "end" ? "flex-row-reverse justify-start" : "flex-row justify-start",
        className
      )}
      {...props}
    />
  )
}

export function MessageAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex shrink-0 items-end mb-1", className)} {...props} />
}

export function MessageContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 max-w-[70%] items-start", className)} {...props} />
}

export function MessageFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[9px] text-muted-foreground/60 px-1 mt-1 flex items-center gap-1", className)} {...props} />
}
