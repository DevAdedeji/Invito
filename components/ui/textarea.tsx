import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-rule text-ink placeholder:text-ink-faint flex field-sizing-content min-h-16 w-full rounded-xs border bg-transparent px-3 py-2.5 text-base transition-colors outline-none",
        "hover:border-rule-strong focus-visible:border-ink",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
