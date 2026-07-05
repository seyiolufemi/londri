"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  BellOff,
  Package,
  Wallet,
  ShieldCheck,
  Banknote,
  UserPlus,
  AlertTriangle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useStore } from "@/lib/mock/store"
import { cn } from "@/lib/utils"
import type { Notification, NotificationType } from "@/types"

const PATH_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/orders": "Orders",
  "/price-list": "Price List",
  "/subscriptions": "Subscription Plans",
  "/transactions": "Transactions",
  "/settings": "Settings",
  "/orders/new": "Create Order",
  "/notifications": "Notifications",
}

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  new_order: Package,
  payment_received: Wallet,
  kyb_status: ShieldCheck,
  withdrawal_completed: Banknote,
  new_subscriber: UserPlus,
  unmatched_transaction: AlertTriangle,
}

function toTitle(pathname: string): string {
  const exact = PATH_TITLES[pathname]
  if (exact) return exact
  const segments = pathname.split("/").filter(Boolean)
  const last = segments[segments.length - 1] ?? ""
  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

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
        "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors hover:bg-muted/50 last:border-0",
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
        <p className="text-sm font-medium text-foreground">{n.title}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatDistanceToNow(n.createdAt, { addSuffix: true })}
        </p>
      </div>
    </button>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const notifications = useStore((s) => s.notifications)
  const markNotificationRead = useStore((s) => s.markNotificationRead)
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead)

  const unreadCount = notifications.filter((n) => !n.read).length
  const recentNotifications = [...notifications]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8)

  function handleNotificationClick(n: Notification) {
    if (!n.read) markNotificationRead(n.id)
    if (n.linkTo) router.push(n.linkTo)
    setOpen(false)
  }

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-8 py-4">
      <h1 className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-foreground">
        {toTitle(pathname)}
      </h1>

      <div className="flex items-center gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-[380px] p-0">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="cursor-pointer text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <BellOff className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {recentNotifications.map((n) => (
                  <NotificationRow key={n.id} n={n} onClick={handleNotificationClick} />
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-border">
              <button
                type="button"
                onClick={() => {
                  router.push("/notifications")
                  setOpen(false)
                }}
                className="w-full py-2 text-center text-sm text-primary hover:underline"
              >
                View all →
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
