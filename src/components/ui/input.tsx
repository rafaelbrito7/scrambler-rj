import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "block min-h-12 w-full min-w-0 rounded-sm border border-input bg-transparent px-3 text-base text-foreground transition-[border-color] file:mr-3 file:min-h-[46px] file:cursor-pointer file:border-0 file:bg-foreground/10 file:px-3 file:text-sm file:font-semibold file:text-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        "[&[type=file]]:cursor-pointer [&[type=file]]:px-0 [&[type=file]]:text-sm [&[type=file]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
