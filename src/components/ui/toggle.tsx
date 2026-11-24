"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const toggleVariants = cva(
  "group/toggle label inline-flex cursor-pointer items-center justify-center gap-1 rounded-sm whitespace-nowrap text-muted-foreground transition-[color,background-color,border-color] duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-transparent",
        outline: "border border-input bg-transparent hover:border-foreground",
      },
      size: {
        default: "min-h-12 min-w-14 px-4",
        sm: "min-h-11 min-w-11 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
