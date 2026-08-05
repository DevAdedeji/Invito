import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-paper-sunken animate-pulse rounded-xs", className)}
      {...props}
    />
  )
}

export { Skeleton }
