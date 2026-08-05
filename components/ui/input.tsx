import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-rule text-ink placeholder:text-ink-faint selection:bg-seal selection:text-seal-ink h-11 w-full min-w-0 rounded-xs border bg-transparent px-3 py-1 text-base transition-colors outline-none",
        "file:text-ink file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "hover:border-rule-strong focus-visible:border-ink",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
