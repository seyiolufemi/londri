import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // order statuses (new)
  requested: { label: "Requested", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  confirmed: { label: "Confirmed", className: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  picked_up: { label: "Picked Up", className: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  ready: { label: "Ready", className: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" },
  ready_for_pickup: { label: "Ready for Pickup", className: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" },
  out_for_delivery: { label: "Out for Delivery", className: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  // legacy (kept for safety)
  received: { label: "Received", className: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  processing: { label: "Processing", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  delivered: { label: "Delivered", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  // subscription statuses
  active: { label: "Active", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
  // kyb / transaction
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
