import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
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

export { Input }
