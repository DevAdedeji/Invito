import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs font-mono text-[11px] font-medium uppercase tracking-[0.14em] transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-ink/85",
        seal: "bg-seal text-seal-ink hover:bg-seal/88",
        outline:
          "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
        subtle:
          "border border-rule bg-transparent text-ink hover:border-ink hover:bg-paper-sunken",
        secondary: "bg-paper-sunken text-ink hover:bg-rule",
        ghost: "text-ink-muted hover:bg-paper-sunken hover:text-ink",
        destructive:
          "border border-destructive/40 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground",
        link: "h-auto p-0 font-sans text-sm normal-case tracking-normal text-seal underline decoration-seal/40 underline-offset-4 hover:decoration-seal",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[10px]",
        lg: "h-13 px-9",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-8",
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
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
