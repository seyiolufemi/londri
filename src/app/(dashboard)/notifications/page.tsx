"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  BellOff,
  Package,
  Wallet,
  ShieldCheck,
  Banknote,
  UserPlus,
  AlertTriangle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useStore } from "@/lib/mock/store"
import DateRangePicker, { isDateInRange, type DateRangeValue } from "@/components/shared/DateRangePicker"
import TablePagination, { paginate } from "@/components/shared/TablePagination"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Notification, NotificationType } from "@/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  new_order: Package,
  payment_received: Wallet,
  kyb_status: ShieldCheck,
  withdrawal_completed: Banknote,
  new_subscriber: UserPlus,
  unmatched_transaction: AlertTriangle,
}

const TYPE_LABELS: Record<NotificationType, string> = {
  new_order: "New Order",
  payment_received: "Payment Received",
  kyb_status: "KYB Status",
  withdrawal_completed: "Withdrawal Completed",
  new_subscriber: "New Subscriber",
  unmatched_transaction: "Unmatched Transaction",
}

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Types" },
  { value: "new_order", label: "New Order" },
  { value: "payment_received", label: "Payment Received" },
  { value: "kyb_status", label: "KYB Status" },
  { value: "withdrawal_completed", label: "Withdrawal Completed" },
  { value: "new_subscriber", label: "New Subscriber" },
  { value: "unmatched_transaction", label: "Unmatched Transaction" },
]

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  n,
  onClick,
}: {
  n: Notification
  onClick: (n: Notification) => void
}) {
  const Icon = TYPE_ICONS[n.type]
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors hover:bg-muted/50 last:border-0",
        !n.read && "bg-primary/[0.03]"
      )}
    >
      <div className="relative mt-0.5 shrink-0">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        {!n.read && (
          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-foreground">{n.title}</p>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {TYPE_LABELS[n.type]}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatDistanceToNow(n.createdAt, { addSuffix: true })}
        </p>
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter()

  const notifications = useStore((s) => s.notifications)
  const markNotificationRead = useStore((s) => s.markNotificationRead)
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead)

  const unreadCount = notifications.filter((n) => !n.read).length

  const [dateRange, setDateRange] = useState<DateRangeValue>("this_month")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)

  function handleDateRangeChange(v: DateRangeValue) {
    setDateRange(v)
    setPage(1)
  }

  function handleTypeChange(v: string) {
    setTypeFilter(v)
    setPage(1)
  }

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [notifications]
  )

  const filtered = useMemo(() => {
    return sorted.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false
      if (!isDateInRange(n.createdAt, dateRange)) return false
      return true
    })
  }, [sorted, typeFilter, dateRange])

  const paged = paginate(filtered, page, PAGE_SIZE)

  function handleNotificationClick(n: Notification) {
    if (!n.read) markNotificationRead(n.id)
    if (n.linkTo) router.push(n.linkTo)
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Notifications
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All your recent activity in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={unreadCount === 0}
            onClick={markAllNotificationsRead}
          >
            Mark all as read
          </Button>
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-4">
        <Select value={typeFilter} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <BellOff className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications match your filters</p>
          </div>
        ) : (
          paged.map((n) => (
            <NotificationRow key={n.id} n={n} onClick={handleNotificationClick} />
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <TablePagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
