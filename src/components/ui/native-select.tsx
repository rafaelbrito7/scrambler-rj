import * as React from "react"
import { cn } from "cn"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr"

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <div
      className={cn("relative w-full has-[select:disabled]:opacity-50", className)}
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        className="block min-h-12 w-full min-w-0 appearance-none rounded-sm border border-input bg-background py-0 pr-10 pl-3 text-base text-foreground transition-[border-color] focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed aria-invalid:border-destructive"
        {...props}
      />
      <CaretDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

export { NativeSelect, NativeSelectOption }
