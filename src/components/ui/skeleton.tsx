import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "premium" | "shimmer"
}) {
  return (
    <div
      className={cn(
        "rounded-lg",
        variant === "default" && "animate-pulse bg-muted",
        variant === "premium" && "bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse",
        variant === "shimmer" && "relative overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
