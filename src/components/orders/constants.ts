import type { OrderChannel, OrderPaymentStatus, OrderStatus } from "@/redux/api/ordersApi"

export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  picked_up: "Picked Up",
  in_progress: "In Progress",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const CHANNEL_CONFIG: Record<OrderChannel, { label: string; className: string }> = {
  online_booking: { label: "Online", className: "bg-blue-50 text-blue-600" },
  walk_in: { label: "Walk-in", className: "bg-purple-50 text-purple-600" },
  subscription_fulfillment: { label: "Subscription", className: "bg-primary/10 text-primary" },
}

export const PAYMENT_CONFIG: Record<OrderPaymentStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-green-50 text-green-600" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
}

// out_for_delivery only applies when the order is being delivered rather than picked up in person.
export function getOrderSteps(toBeDelivered: boolean): OrderStatus[] {
  const base: OrderStatus[] = ["requested", "confirmed", "picked_up", "in_progress", "ready_for_pickup"]
  return toBeDelivered ? [...base, "out_for_delivery", "completed"] : [...base, "completed"]
}

export function getNextStatus(status: OrderStatus, toBeDelivered: boolean): OrderStatus | null {
  const steps = getOrderSteps(toBeDelivered)
  const idx = steps.indexOf(status)
  if (idx === -1 || idx === steps.length - 1) return null
  return steps[idx + 1]
}

const NEXT_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: "Confirm Order",
  picked_up: "Mark as Picked Up",
  in_progress: "Start Processing",
  ready_for_pickup: "Mark Ready for Pickup",
  out_for_delivery: "Send Out for Delivery",
  completed: "Mark as Completed",
}

export function getNextActionLabel(status: OrderStatus, toBeDelivered: boolean): string | null {
  const next = getNextStatus(status, toBeDelivered)
  return next ? (NEXT_ACTION_LABELS[next] ?? null) : null
}

export function isStatusReached(current: OrderStatus, target: OrderStatus, toBeDelivered: boolean): boolean {
  if (current === "cancelled") return false
  const steps = getOrderSteps(toBeDelivered)
  return steps.indexOf(current) >= steps.indexOf(target)
}
