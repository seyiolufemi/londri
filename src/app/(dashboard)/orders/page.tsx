"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  SearchX,
  X,
  MessageCircle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { useKybStatus } from "@/lib/hooks/useKybStatus"
import StatusBadge from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Order, OrderStatus, OrderStatusEvent } from "@/types"

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = "all" | OrderStatus
type ChannelFilter = "all" | "online" | "walk_in" | "subscription"
type PaymentFilter = "all" | "paid" | "unpaid"
type DateRangeFilter = "all" | "today" | "this_week" | "this_month"

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_ORDER: OrderStatus[] = [
  "requested",
  "confirmed",
  "picked_up",
  "in_progress",
  "ready",
  "completed",
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  picked_up: "Picked Up",
  in_progress: "In Progress",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  requested: "confirmed",
  confirmed: "picked_up",
  picked_up: "in_progress",
  in_progress: "ready",
  ready: "completed",
}

const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  requested: "Confirm Order",
  confirmed: "Mark as Picked Up",
  picked_up: "Start Processing",
  in_progress: "Mark Ready",
  ready: "Mark as Completed",
}

const CHANNEL_CONFIG = {
  online: { label: "Online", className: "bg-blue-50 text-blue-600" },
  walk_in: { label: "Walk-in", className: "bg-purple-50 text-purple-600" },
  subscription: { label: "Subscription", className: "bg-primary/10 text-primary" },
}

const PAYMENT_CONFIG = {
  paid: { label: "Paid", className: "bg-green-50 text-green-600" },
  unpaid: { label: "Unpaid", className: "bg-amber-50 text-amber-600" },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return "\u20a6" + amount.toLocaleString("en-NG")
}

function isStatusReached(current: OrderStatus, target: OrderStatus): boolean {
  if (current === "cancelled") return false
  return STATUS_ORDER.indexOf(current) >= STATUS_ORDER.indexOf(target)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: "online" | "walk_in" | "subscription" }) {
  const cfg = CHANNEL_CONFIG[channel]
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

function PaymentBadge({ status }: { status: "paid" | "unpaid" }) {
  const cfg = PAYMENT_CONFIG[status]
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

// ─── Order Detail Panel ───────────────────────────────────────────────────────

interface PanelProps {
  order: Order
  events: OrderStatusEvent[]
  onAdvanceStatus: () => void
  onCancelRequest: () => void
  onSimulatePayment: () => void
  onWhatsApp: (action: string) => void
}

function OrderDetailPanel({
  order,
  events,
  onAdvanceStatus,
  onCancelRequest,
  onSimulatePayment,
  onWhatsApp,
}: PanelProps) {
  const nextActionLabel = NEXT_ACTION_LABEL[order.status]
  const isComplete =
    order.status === "completed" || order.status === "cancelled"
  const mustPayFirst =
    order.status === "ready" && order.paymentStatus === "unpaid"

  return (
    <div className="p-6">
      {/* Panel header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-foreground">
          {order.reference}
        </h2>
        <div className="mt-1.5 flex items-center gap-2">
          <ChannelBadge channel={order.channel} />
          <span className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Customer */}
      <section className="mb-6">
        <div className="rounded-lg bg-muted/30 p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Customer</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Name</span>
              <span className="text-sm text-foreground">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">WhatsApp</span>
              <span className="text-sm text-foreground">{order.customerPhone}</span>
            </div>
            {order.notes && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-muted-foreground">Note</span>
                <span className="text-right text-sm text-muted-foreground">{order.notes}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Items & Pricing */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-foreground">Items & Pricing</h3>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} \u00d7 {item.quantity}
              </span>
              <span className="tabular-nums text-foreground">
                {formatNaira(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
        <div className="my-3 border-t border-border" />
        <div className="flex justify-between">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-base font-semibold tabular-nums text-foreground">
            {formatNaira(order.totalAmount)}
          </span>
        </div>
      </section>

      {/* Payment */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-foreground">Payment</h3>
        <div className="flex items-center justify-between">
          <PaymentBadge status={order.paymentStatus} />
          {order.paymentStatus === "unpaid" && (
            <Button variant="outline" size="sm" onClick={onSimulatePayment}>
              Simulate Payment Received
            </Button>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-6">
        <h3 className="mb-4 text-sm font-medium text-foreground">Timeline</h3>
        {order.status === "cancelled" ? (
          <div className="flex items-center gap-3">
            <XCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Order Cancelled</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.updatedAt).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                {new Date(order.updatedAt).toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {STATUS_ORDER.map((status, i) => {
              const reached = isStatusReached(order.status, status)
              const event = events.find((e) => e.status === status)
              const isLast = i === STATUS_ORDER.length - 1
              return (
                <div key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "mt-0.5 size-2.5 shrink-0 rounded-full border-2",
                        reached
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30 bg-background"
                      )}
                    />
                    {!isLast && (
                      <div
                        className={cn(
                          "mt-1 w-0.5 flex-1",
                          reached ? "bg-primary" : "bg-muted-foreground/20"
                        )}
                        style={{ minHeight: "24px" }}
                      />
                    )}
                  </div>
                  <div className={cn("pb-4", isLast && "pb-0")}>
                    <p
                      className={cn(
                        "text-sm",
                        reached
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </p>
                    {event && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {new Date(event.createdAt).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Status Action */}
      <section className="mb-6">
        {isComplete ? (
          <p className="text-center text-sm text-muted-foreground">
            {order.status === "completed"
              ? "This order is complete"
              : "This order was cancelled"}
          </p>
        ) : (
          <div className="space-y-2">
            {mustPayFirst ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block w-full">
                    <Button
                      disabled
                      className="w-full cursor-not-allowed opacity-50"
                    >
                      Mark as Completed
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Payment required before completing</TooltipContent>
              </Tooltip>
            ) : (
              nextActionLabel && (
                <Button className="w-full" onClick={onAdvanceStatus}>
                  {nextActionLabel}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              className="w-full text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onCancelRequest}
            >
              Cancel Order
            </Button>
          </div>
        )}
      </section>

      {/* WhatsApp */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-foreground">
          Customer Communication
        </h3>
        <div className="flex flex-col gap-2">
          {order.paymentStatus === "unpaid" && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onWhatsApp("Invoice / Payment Link")}
            >
              <MessageCircle className="mr-2 size-3.5" />
              Send Invoice / Payment Link
            </Button>
          )}
          {order.status === "ready" && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onWhatsApp("Ready for Pickup notification")}
            >
              <MessageCircle className="mr-2 size-3.5" />
              Notify Ready for Pickup
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => onWhatsApp("Custom message")}
          >
            <MessageCircle className="mr-2 size-3.5" />
            Send Custom Message
          </Button>
        </div>
      </section>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const router = useRouter()
  const { kybStatus } = useKybStatus()
  const orders = useStore((s) => s.orders)
  const orderStatusEvents = useStore((s) => s.orderStatusEvents)
  const updateOrderStatus = useStore((s) => s.updateOrderStatus)
  const updateOrderPaymentStatus = useStore((s) => s.updateOrderPaymentStatus)

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all")
  const [search, setSearch] = useState("")

  // Panel
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false)

  const selectedOrder = selectedOrderId
    ? (orders.find((o) => o.id === selectedOrderId) ?? null)
    : null

  // Filtered list
  const filteredOrders = useMemo(() => {
    let result = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter)
    }
    if (channelFilter !== "all") {
      result = result.filter((o) => o.channel === channelFilter)
    }
    if (paymentFilter !== "all") {
      result = result.filter((o) => o.paymentStatus === paymentFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.reference.toLowerCase().includes(q)
      )
    }
    if (dateFilter !== "all") {
      const now = new Date()
      let start: Date
      if (dateFilter === "today") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (dateFilter === "this_week") {
        const day = now.getDay()
        const diff = day === 0 ? 6 : day - 1
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
      }
      result = result.filter((o) => new Date(o.createdAt) >= start)
    }
    return result
  }, [orders, statusFilter, channelFilter, paymentFilter, dateFilter, search])

  // Active filter pills
  const activeFilters: { key: string; label: string; onRemove: () => void }[] =
    []
  if (statusFilter !== "all")
    activeFilters.push({
      key: "status",
      label: STATUS_LABELS[statusFilter],
      onRemove: () => setStatusFilter("all"),
    })
  if (channelFilter !== "all")
    activeFilters.push({
      key: "channel",
      label: CHANNEL_CONFIG[channelFilter].label,
      onRemove: () => setChannelFilter("all"),
    })
  if (paymentFilter !== "all")
    activeFilters.push({
      key: "payment",
      label: PAYMENT_CONFIG[paymentFilter].label,
      onRemove: () => setPaymentFilter("all"),
    })
  if (dateFilter !== "all")
    activeFilters.push({
      key: "date",
      label:
        dateFilter === "today"
          ? "Today"
          : dateFilter === "this_week"
          ? "This Week"
          : "This Month",
      onRemove: () => setDateFilter("all"),
    })

  const locked = kybStatus !== "approved"

  function openOrder(id: string) {
    setSelectedOrderId(id)
    setSheetOpen(true)
  }

  function handleAdvanceStatus() {
    if (!selectedOrder) return
    const next = NEXT_STATUS[selectedOrder.status]
    if (!next) return
    if (next === "completed" && selectedOrder.paymentStatus === "unpaid") return
    updateOrderStatus(selectedOrder.id, next)
    toast.success(`Status updated to ${STATUS_LABELS[next]}`, {
      description: selectedOrder.reference,
    })
  }

  function handleCancelOrder() {
    if (!selectedOrder) return
    updateOrderStatus(selectedOrder.id, "cancelled")
    setCancelAlertOpen(false)
    toast.success("Order cancelled", { description: selectedOrder.reference })
  }

  function handleSimulatePayment() {
    if (!selectedOrder) return
    updateOrderPaymentStatus(selectedOrder.id, "paid")
    toast.success(`Payment received \u2014 ${formatNaira(selectedOrder.totalAmount)}`)
  }

  function handleWhatsApp(action: string) {
    toast.success("Message sent via WhatsApp", { description: action })
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Orders
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage and track all your orders
          </p>
        </div>
        <Button
          disabled={locked}
          className={cn(locked && "cursor-not-allowed opacity-50")}
          onClick={() => {
            if (locked) {
              toast.warning("Complete verification to create orders.")
              return
            }
            router.push("/orders/new")
          }}
        >
          <Plus className="mr-1.5 size-4" />
          New Walk-in Order
        </Button>
      </div>

      {/* Filter bar */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={channelFilter}
          onValueChange={(v) => setChannelFilter(v as ChannelFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="walk_in">Walk-in</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentFilter}
          onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={dateFilter}
          onValueChange={(v) => setDateFilter(v as DateRangeFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-64 pl-9"
            placeholder="Search by customer or order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
            >
              {f.label}
              <button
                onClick={f.onRemove}
                className="ml-1 rounded-full hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No orders found</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Order ID
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Items
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Channel
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Payment
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="pl-4 pr-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => openOrder(order.id)}
                >
                  <TableCell className="pl-5 pr-4 text-sm font-medium text-foreground">
                    {order.reference}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-foreground">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="px-4">
                    <ChannelBadge channel={order.channel} />
                  </TableCell>
                  <TableCell className="px-4 text-sm font-medium tabular-nums text-foreground">
                    {formatNaira(order.totalAmount)}
                  </TableCell>
                  <TableCell className="px-4">
                    <PaymentBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="pl-4 pr-5 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Slide-in detail panel */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto p-0 sm:max-w-xl"
        >
          {selectedOrder && (
            <OrderDetailPanel
              order={selectedOrder}
              events={orderStatusEvents.filter(
                (e) => e.orderId === selectedOrder.id
              )}
              onAdvanceStatus={handleAdvanceStatus}
              onCancelRequest={() => setCancelAlertOpen(true)}
              onSimulatePayment={handleSimulatePayment}
              onWhatsApp={handleWhatsApp}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel confirmation */}
      <AlertDialog open={cancelAlertOpen} onOpenChange={setCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel {selectedOrder?.reference}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
