"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { mockCustomerOrders } from "@/lib/mock/data"
import { useAppDispatch } from "@/hooks/redux"
import { apiManager } from "@/redux/apiManager"
import { useCustomerLogoutMutation, useGetCustomerMeQuery } from "@/redux/api/customerAuthApi"
import StatusBadge from "@/components/shared/StatusBadge"
import TablePagination, { paginate } from "@/components/shared/TablePagination"

const PAGE_SIZE = 3

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function itemsSummary(items: { name: string; quantity: number }[]): string {
  return items.map((i) => `${i.name} × ${i.quantity}`).join(", ")
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const hasHydrated = useStore((s) => s.hasHydrated)
  const isAuthenticated = useStore((s) => s.customerAuth.isAuthenticated)
  const customerSignOut = useStore((s) => s.customerSignOut)
  const [customerLogout] = useCustomerLogoutMutation()
  const [page, setPage] = useState(1)

  // Real /auth/me call for the signed-in customer — wired here so its actual
  // response shape can be inspected (network tab) and fixed once known.
  const { data: me } = useGetCustomerMeQuery(undefined, {
    skip: !hasHydrated || !isAuthenticated,
  })

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace("/account/login")
  }, [hasHydrated, isAuthenticated, router])

  const pagedOrders = paginate(mockCustomerOrders, page, PAGE_SIZE)

  async function handleSignOut() {
    try {
      await customerLogout().unwrap()
    } finally {
      dispatch(apiManager.util.resetApiState())
      customerSignOut()
      router.push("/")
    }
  }

  // Wait for sessionStorage rehydration before deciding — otherwise a
  // signed-in customer briefly reads as unauthenticated on every refresh.
  if (!hasHydrated || !isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
              Your Orders
            </h1>
            {me && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Signed in as {me.name} ({me.email})
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-background">
          {pagedOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-col gap-1.5 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-foreground">{order.businessName}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {itemsSummary(order.items)}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDate(order.createdAt)}</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatNaira(order.totalAmount)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <TablePagination
          currentPage={page}
          totalItems={mockCustomerOrders.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
