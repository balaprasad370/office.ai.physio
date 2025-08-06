import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow]",
        "placeholder:text-n-4",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-color-1 focus:ring-2 focus:ring-color-1/50",
        "aria-invalid:border-color-3 aria-invalid:ring-color-3/20",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
