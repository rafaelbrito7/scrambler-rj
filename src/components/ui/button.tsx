import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button label inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm border whitespace-nowrap transition-[color,background-color,border-color] duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary",
        outline:
          "border-foreground/70 text-foreground hover:border-foreground hover:bg-foreground/10",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-foreground/15",
        ghost:
          "border-transparent text-foreground underline decoration-primary decoration-2 underline-offset-[6px] hover:text-highlight",
        destructive:
          "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "border-transparent text-highlight underline underline-offset-4 hover:text-foreground",
      },
      size: {
        default: "min-h-12 px-5",
        sm: "min-h-11 px-4",
        inline: "min-h-11 px-0",
        icon: "size-12",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
