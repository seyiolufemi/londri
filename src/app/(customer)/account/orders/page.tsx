"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { useAppDispatch } from "@/hooks/redux"
import { apiManager } from "@/redux/apiManager"
import { useCustomerLogoutMutation } from "@/redux/api/customerAuthApi"
import { useGetCustomerOrdersQuery, type CustomerOrderItem } from "@/redux/api/customerOrdersApi"
import { useCustomerSession } from "@/lib/hooks/useCustomerSession"
import StatusBadge from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
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

function itemsSummary(items: CustomerOrderItem[]): string {
  return items.map((i) => `${i.item_name} × ${i.quantity}`).join(", ")
}

function OrderRowSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 p-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const customerSignOut = useStore((s) => s.customerSignOut)
  const [customerLogout] = useCustomerLogoutMutation()
  const [page, setPage] = useState(1)

  const { hasHydrated, isAuthenticated, me } = useCustomerSession()

  const { data: orders, isLoading } = useGetCustomerOrdersQuery(undefined, {
    skip: !hasHydrated || !isAuthenticated,
  })

  const allOrders = orders ?? []
  const pagedOrders = paginate(allOrders, page, PAGE_SIZE)

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
          {isLoading ? (
            <>
              <OrderRowSkeleton />
              <OrderRowSkeleton />
              <OrderRowSkeleton />
            </>
          ) : allOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              You haven&apos;t placed any orders yet.
            </p>
          ) : (
            pagedOrders.map((order) => (
              <Link
                key={order.reference_id}
                href={`/account/orders/${encodeURIComponent(order.reference_id)}`}
                className="flex flex-col gap-1.5 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-foreground">{order.reference_id}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {itemsSummary(order.items)}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(order.created_at)}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatNaira(order.amount)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {!isLoading && allOrders.length > 0 && (
          <TablePagination
            currentPage={page}
            totalItems={allOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
