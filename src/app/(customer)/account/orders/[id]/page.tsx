"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, MapPin } from "lucide-react"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { mockCustomerOrders } from "@/lib/mock/data"
import StatusBadge from "@/components/shared/StatusBadge"

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
  const router = useRouter()
  const hasHydrated = useStore((s) => s.hasHydrated)
  const isAuthenticated = useStore((s) => s.customerAuth.isAuthenticated)

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace("/account/login")
  }, [hasHydrated, isAuthenticated, router])

  // Wait for sessionStorage rehydration before deciding — otherwise a
  // signed-in customer briefly reads as unauthenticated on every refresh.
  if (!hasHydrated || !isAuthenticated) return null

  const order = mockCustomerOrders.find((o) => o.id === params.id)

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
              {order.businessName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{order.reference}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>

        {/* Item breakdown */}
        <div className="mt-6 rounded-lg border border-border bg-background">
          {order.items.map((item, idx) => (
            <div
              key={item.priceListItemId}
              className={`flex items-center justify-between p-4 ${idx > 0 ? "border-t border-border" : ""}`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatNaira(item.subtotal)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border p-4 text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="tabular-nums text-foreground">{formatNaira(order.totalAmount)}</span>
          </div>
        </div>

        {/* Pickup address */}
        <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {order.pickupAddress}
        </p>
      </div>
    </div>
  )
}
