import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Each variant is a meaning, not a decoration: settled, waiting on someone, plain fact, problem.
const badgeVariants = cva(
  "label inline-flex w-fit shrink-0 items-center gap-1 rounded-sm border px-2 py-1 text-xs whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-foreground bg-foreground text-background",
        attention: "border-primary bg-primary/15 text-highlight",
        outline: "border-foreground/50 text-foreground",
        destructive: "border-destructive bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
