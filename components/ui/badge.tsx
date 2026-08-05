import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-xs border px-2 py-1 font-mono text-[10px] font-medium tracking-[0.12em] whitespace-nowrap uppercase [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-ink bg-ink text-paper",
        outline: "border-rule text-ink-muted",
        secondary: "border-transparent bg-paper-sunken text-ink-muted",
        seal: "border-seal/25 bg-seal-soft text-seal",
        attending: "border-olive/25 bg-olive-soft text-olive",
        maybe: "border-ochre/25 bg-ochre-soft text-ochre",
        declined: "border-rule bg-paper-sunken text-ink-faint",
        destructive: "border-destructive/30 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
