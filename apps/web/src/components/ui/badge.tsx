import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        lead: "border-transparent bg-[var(--lead)] text-white",
        copper: "border-transparent bg-[var(--copper)] text-white",
        unknown: "border-transparent bg-[var(--amber)] text-[var(--ink)]",
        outline: "border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
