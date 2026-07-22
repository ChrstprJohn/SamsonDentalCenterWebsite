import * as React from "react"

import { cn } from "@/shared/utils"

const itemVariants = {
  outline: "border border-card-border bg-card rounded-2xl",
  ghost: "rounded-2xl hover:bg-secondary-bg/30",
} as const

const itemSizes = {
  default: "p-4 gap-3",
  sm: "p-3 gap-2",
} as const

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof itemVariants
  size?: keyof typeof itemSizes
}

function Item({
  className,
  variant = "outline",
  size = "default",
  ...props
}: ItemProps) {
  return (
    <div
      data-slot="item"
      className={cn(
        "flex items-center w-full",
        itemVariants[variant],
        itemSizes[size],
        className
      )}
      {...props}
    />
  )
}

function ItemMedia({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-media"
      className={cn("shrink-0 flex items-center justify-center text-muted-foreground", className)}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex-1 min-w-0 flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="item-title"
      className={cn("text-sm font-semibold text-text-primary", className)}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="item-description"
      className={cn("text-xs text-text-muted", className)}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-actions"
      className={cn("shrink-0 flex items-center gap-2", className)}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
}
