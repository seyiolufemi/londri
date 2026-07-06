import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Loader2, MessageCircle, XCircle } from "lucide-react"
import { useGetOrderQuery, useUpdateOrderStatusMutation, type OrderStatus } from "@/redux/api/ordersApi"
import { apiError } from "@/lib/apiError"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CHANNEL_CONFIG,
  PAYMENT_CONFIG,
  STATUS_LABELS,
  formatNaira,
  getNextActionLabel,
  getNextStatus,
  getOrderSteps,
  isStatusReached,
} from "./constants"

interface OrderDetailPanelProps {
  orderId: string
}

function OrderDetailSkeleton() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-6 w-40" />
        <div className="mt-1.5 flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Customer */}
      <div className="mb-6 rounded-lg bg-muted/30 p-4">
        <Skeleton className="mb-3 h-4 w-20" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Items & Pricing */}
      <div className="mb-6">
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="my-3 border-t border-border" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Payment */}
      <div className="mb-6">
        <Skeleton className="mb-3 h-4 w-16" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <Skeleton className="mb-4 h-4 w-20" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-2.5 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Status action */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

export default function OrderDetailPanel({ orderId }: OrderDetailPanelProps) {
  const { data: order, isLoading } = useGetOrderQuery(orderId)
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation()
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false)

  const stepTimestamps = useMemo(() => {
    if (!order) return {} as Partial<Record<OrderStatus, string>>
    const map: Partial<Record<OrderStatus, string>> = { requested: order.created_at }
    order.status_events.forEach((e) => {
      map[e.to_status as OrderStatus] = e.timestamp
    })
    return map
  }, [order])

  if (isLoading || !order) {
    return <OrderDetailSkeleton />
  }

  const next = getNextStatus(order.status, order.to_be_delivered)
  const nextActionLabel = getNextActionLabel(order.status, order.to_be_delivered)
  const isComplete = order.status === "completed" || order.status === "cancelled"
  const mustPayFirst = next === "completed" && order.payment_status !== "paid"
  const steps = getOrderSteps(order.to_be_delivered)
  const currentOrderId = order.id
  const referenceId = order.reference_id

  async function handleAdvanceStatus() {
    if (!next || mustPayFirst) return
    try {
      await updateOrderStatus({ orderId: currentOrderId, body: { status: next } }).unwrap()
      toast.success(`Status updated to ${STATUS_LABELS[next]}`, { description: referenceId })
    } catch (error) {
      toast.error(apiError(error, "Couldn't update order status"))
    }
  }

  async function handleCancelOrder() {
    try {
      await updateOrderStatus({ orderId: currentOrderId, body: { status: "cancelled" } }).unwrap()
      setCancelAlertOpen(false)
      toast.success("Order cancelled", { description: referenceId })
    } catch (error) {
      toast.error(apiError(error, "Couldn't cancel order"))
    }
  }

  function handleWhatsApp(action: string) {
    toast.success("Message sent via WhatsApp", { description: action })
  }

  return (
    <div className="p-6">
      {/* Panel header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-foreground">
          {order.reference_id}
        </h2>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              CHANNEL_CONFIG[order.channel].className
            )}
          >
            {CHANNEL_CONFIG[order.channel].label}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en-NG", {
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
              <span className="text-sm text-foreground">{order.customer_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">WhatsApp</span>
              <span className="text-sm text-foreground">{order.customer_whatsapp}</span>
            </div>
            {order.to_be_delivered && order.delivery_address && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-muted-foreground">Delivery Address</span>
                <span className="text-right text-sm text-muted-foreground">{order.delivery_address}</span>
              </div>
            )}
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
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.item_name} × {item.quantity}
              </span>
              <span className="tabular-nums text-foreground">{formatNaira(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="my-3 border-t border-border" />
        <div className="flex justify-between">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-base font-semibold tabular-nums text-foreground">{formatNaira(order.amount)}</span>
        </div>
      </section>

      {/* Payment */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-foreground">Payment</h3>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            PAYMENT_CONFIG[order.payment_status].className
          )}
        >
          {PAYMENT_CONFIG[order.payment_status].label}
        </span>
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
                {new Date(order.updated_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}{" "}
                {new Date(order.updated_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {steps.map((status, i) => {
              const reached = isStatusReached(order.status, status, order.to_be_delivered)
              const timestamp = stepTimestamps[status]
              const isLast = i === steps.length - 1
              return (
                <div key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "mt-0.5 size-2.5 shrink-0 rounded-full border-2",
                        reached ? "border-primary bg-primary" : "border-muted-foreground/30 bg-background"
                      )}
                    />
                    {!isLast && (
                      <div
                        className={cn("mt-1 w-0.5 flex-1", reached ? "bg-primary" : "bg-muted-foreground/20")}
                        style={{ minHeight: "24px" }}
                      />
                    )}
                  </div>
                  <div className={cn("pb-4", isLast && "pb-0")}>
                    <p className={cn("text-sm", reached ? "font-medium text-foreground" : "text-muted-foreground")}>
                      {STATUS_LABELS[status]}
                    </p>
                    {timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(timestamp).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}{" "}
                        {new Date(timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
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
            {order.status === "completed" ? "This order is complete" : "This order was cancelled"}
          </p>
        ) : (
          <div className="space-y-2">
            {mustPayFirst ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block w-full">
                    <Button disabled className="w-full cursor-not-allowed opacity-50">
                      Mark as Completed
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Payment required before completing</TooltipContent>
              </Tooltip>
            ) : (
              nextActionLabel && (
                <Button className="w-full" onClick={handleAdvanceStatus} disabled={isUpdating}>
                  {isUpdating && <Loader2 className="size-4 animate-spin" />}
                  {nextActionLabel}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              className="w-full text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setCancelAlertOpen(true)}
            >
              Cancel Order
            </Button>
          </div>
        )}
      </section>

      {/* WhatsApp */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-foreground">Customer Communication</h3>
        <div className="flex flex-col gap-2">
          {order.payment_status === "pending" && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleWhatsApp("Invoice / Payment Link")}
            >
              <MessageCircle className="mr-2 size-3.5" />
              Send Invoice / Payment Link
            </Button>
          )}
          {order.status === "ready_for_pickup" && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleWhatsApp("Ready for Pickup notification")}
            >
              <MessageCircle className="mr-2 size-3.5" />
              Notify Ready for Pickup
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleWhatsApp("Custom message")}
          >
            <MessageCircle className="mr-2 size-3.5" />
            Send Custom Message
          </Button>
        </div>
      </section>

      <AlertDialog open={cancelAlertOpen} onOpenChange={setCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel {order.reference_id}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelOrder}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="size-4 animate-spin" />}
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
