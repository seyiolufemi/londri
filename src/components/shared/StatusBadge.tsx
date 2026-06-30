import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  received: { label: "Received", className: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  processing: { label: "Processing", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  ready: { label: "Ready", className: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" },
  delivered: { label: "Delivered", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  under_review: { label: "Under Review", className: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  successful: { label: "Successful", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-muted text-muted-foreground" }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
