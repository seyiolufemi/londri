import type { SubscriptionStatus } from "@/types"

export const BILLING_LABELS: Record<string, string> = {
  weekly: "/week",
  monthly: "/month",
  yearly: "/year",
}

export const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive",
  },
}

export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}
