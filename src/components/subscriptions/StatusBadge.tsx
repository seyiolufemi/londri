import type { SubscriptionStatus } from "@/types"
import { STATUS_CONFIG } from "./constants"
import { cn } from "@/lib/utils"

export default function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  )
}
