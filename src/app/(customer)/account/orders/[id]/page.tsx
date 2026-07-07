"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import Navbar from "@/components/customer/Navbar"
import { useGetCustomerOrdersQuery } from "@/redux/api/customerOrdersApi"
import { useCustomerSession } from "@/lib/hooks/useCustomerSession"
import StatusBadge from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function CustomerOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { hasHydrated, isAuthenticated } = useCustomerSession()

  // No per-order detail endpoint exists — filter the same cached order-list
  // query (same query args as the orders page, so no extra network request).
  const { data: orders, isLoading } = useGetCustomerOrdersQuery(undefined, {
    skip: !hasHydrated || !isAuthenticated,
  })

  // Wait for sessionStorage rehydration before deciding — otherwise a
  // signed-in customer briefly reads as unauthenticated on every refresh.
  if (!hasHydrated || !isAuthenticated) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-10">
          <Skeleton className="mb-5 h-4 w-32" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-6 h-32 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  const order = (orders ?? []).find((o) => o.reference_id === decodeURIComponent(params.id))

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-medium text-foreground">Order not found</p>
          <Link
            href="/account/orders"
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            ← Back to your orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/account/orders"
          className="mb-5 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to your orders
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
              {order.reference_id}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{order.customer_name}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{formatDate(order.created_at)}</p>

        {/* Item breakdown — no per-item price in this response, only the order total */}
        <div className="mt-6 rounded-lg border border-border bg-background">
          {order.items.map((item, idx) => (
            <div
              key={item.item_name}
              className={`flex items-center justify-between p-4 ${idx > 0 ? "border-t border-border" : ""}`}
            >
              <p className="text-sm font-medium text-foreground">{item.item_name}</p>
              <span className="text-xs text-muted-foreground">Qty {item.quantity}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border p-4 text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="tabular-nums text-foreground">{formatNaira(order.amount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
