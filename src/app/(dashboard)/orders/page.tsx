"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import { useListOrdersQuery, type ListOrdersParams, type Period } from "@/redux/api/ordersApi"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { DateRangeValue } from "@/components/shared/DateRangePicker"
import OrderStatCards from "@/components/orders/OrderStatCards"
import OrderFilters, { type ChannelFilter, type PaymentFilter, type StatusFilter } from "@/components/orders/OrderFilters"
import OrdersTable from "@/components/orders/OrdersTable"
import OrderDetailPanel from "@/components/orders/OrderDetailPanel"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

function toPeriodParams(range: DateRangeValue): Pick<ListOrdersParams, "period" | "start_date" | "end_date"> {
  if (typeof range === "string") return { period: range as Period }
  return {
    period: "custom",
    start_date: format(range.from, "yyyy-MM-dd"),
    end_date: format(range.to, "yyyy-MM-dd"),
  }
}

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersPageContent />
    </Suspense>
  )
}

function OrdersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: business } = useGetMyBusinessQuery()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateRangeValue>("this_month")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // Coming back from a payment redirect (?orderId=...) — open that order's detail,
  // adjusted during render rather than in an effect (see react-hooks/set-state-in-effect).
  const orderIdParam = searchParams.get("orderId")
  const [handledOrderIdParam, setHandledOrderIdParam] = useState<string | null>(null)
  if (orderIdParam && orderIdParam !== handledOrderIdParam) {
    setHandledOrderIdParam(orderIdParam)
    setSelectedOrderId(orderIdParam)
    setSheetOpen(true)
  }

  // Strip the query param once handled — a genuine side effect on browser history.
  useEffect(() => {
    if (orderIdParam) {
      router.replace("/orders")
    }
  }, [orderIdParam, router])

  const params: ListOrdersParams = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(channelFilter !== "all" && { channel: channelFilter }),
    ...(paymentFilter !== "all" && { payment_status: paymentFilter }),
    ...(debouncedSearch.trim() && { reference_id: debouncedSearch.trim() }),
    ...toPeriodParams(dateFilter),
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }

  const { data, isLoading, isFetching } = useListOrdersQuery(params)
  const orders = data?.orders ?? []
  const locked = business?.current_kyb_status !== "verified"

  function resetToFirstPage() {
    setPage(1)
  }

  function openOrder(id: string) {
    setSelectedOrderId(id)
    setSheetOpen(true)
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Orders
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage and track all your orders</p>
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
          New Order
        </Button>
      </div>

      <OrderStatCards stats={data?.stats} isLoading={isLoading} />

      <OrderFilters
        status={statusFilter}
        channel={channelFilter}
        payment={paymentFilter}
        dateRange={dateFilter}
        search={search}
        onStatusChange={(v) => {
          setStatusFilter(v)
          resetToFirstPage()
        }}
        onChannelChange={(v) => {
          setChannelFilter(v)
          resetToFirstPage()
        }}
        onPaymentChange={(v) => {
          setPaymentFilter(v)
          resetToFirstPage()
        }}
        onDateRangeChange={(v) => {
          setDateFilter(v)
          resetToFirstPage()
        }}
        onSearchChange={(v) => {
          setSearch(v)
          resetToFirstPage()
        }}
      />

      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={data?.pagination.total ?? 0}
        onPageChange={setPage}
        onRowClick={openOrder}
      />

      {/* Slide-in detail panel */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selectedOrderId && <OrderDetailPanel orderId={selectedOrderId} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}
