import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-all duration-300 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Shadcn UI & Original Project support
        default:
          "bg-gradient-to-r from-primary-start to-primary-end text-white shadow-lg shadow-primary-start/10 hover:from-primary-hover-start hover:to-primary-hover-end",
        primary:
          "bg-gradient-to-r from-primary-start to-primary-end text-white shadow-lg shadow-primary-start/10 hover:from-primary-hover-start hover:to-primary-hover-end",
        secondary:
          "border border-card-border bg-card text-secondary-text hover:bg-secondary-bg-hover",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/10 hover:from-red-500 hover:to-rose-500",
        danger:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/10 hover:from-red-500 hover:to-rose-500",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-secondary-bg",
        glass:
          "border border-white/10 bg-white/5 text-slate-100 backdrop-blur-md hover:bg-white/10 hover:border-white/20",
        outline:
          "border border-border bg-background hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-2.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-7 py-3 text-base",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs",
        icon: "size-8 p-0",
        "icon-xs": "size-6 p-0",
        "icon-sm": "size-7 p-0",
        "icon-lg": "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
