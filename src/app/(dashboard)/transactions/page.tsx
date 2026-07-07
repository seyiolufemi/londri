"use client"

import { useEffect, useRef, useState } from "react"
import { Wallet } from "lucide-react"
import { format } from "date-fns"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import { useListTransactionsQuery, type ListTransactionsParams } from "@/redux/api/transactionsApi"
import type { Period } from "@/redux/api/ordersApi"
import type { DateRangeValue } from "@/components/shared/DateRangePicker"
import TransactionFilters, { type StatusFilter } from "@/components/transactions/TransactionFilters"
import TransactionsTable from "@/components/transactions/TransactionsTable"
import PayoutSection from "@/components/transactions/PayoutSection"
import { formatNaira } from "@/components/transactions/constants"
import { PAYOUTS_ENABLED } from "@/lib/featureFlags"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

function toPeriodParams(range: DateRangeValue): Pick<ListTransactionsParams, "period" | "start_date" | "end_date"> {
  if (typeof range === "string") return { period: range as Period }
  return {
    period: "custom",
    start_date: format(range.from, "yyyy-MM-dd"),
    end_date: format(range.to, "yyyy-MM-dd"),
  }
}

export default function TransactionsPage() {
  const { data: business } = useGetMyBusinessQuery()
  const isApproved = business?.current_kyb_status === "verified"

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateRangeValue>("this_month")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const params: ListTransactionsParams = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(debouncedSearch.trim() && { reference_id: debouncedSearch.trim() }),
    ...toPeriodParams(dateFilter),
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }

  const { data, isLoading } = useListTransactionsQuery(params)
  const transactions = data?.transactions ?? []

  function handleStatusChange(v: StatusFilter) {
    setStatusFilter(v)
    setPage(1)
  }

  function handleSearchChange(v: string) {
    setSearch(v)
    setPage(1)
  }

  function handleDateRangeChange(v: DateRangeValue) {
    setDateFilter(v)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Transactions
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Track payments and manage payouts</p>
        </div>
      </div>

      {/* Available Balance — single standalone card */}
      <div className="max-w-xs">
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Wallet className="size-4 text-muted-foreground" />
            </div>
          </div>
          <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
            {isLoading ? "—" : formatNaira(data?.available_balance ?? 0)}
          </p>
        </div>
      </div>

      {/* Section 1 — Transactions */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">Transactions</h2>

        <TransactionFilters
          status={statusFilter}
          onStatusChange={handleStatusChange}
          search={search}
          onSearchChange={handleSearchChange}
          dateRange={dateFilter}
          onDateRangeChange={handleDateRangeChange}
        />

        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={data?.pagination.total ?? 0}
          onPageChange={setPage}
        />
      </div>

      {/* Section 2 — Payout History (mock until a payouts endpoint exists) */}
      {PAYOUTS_ENABLED && <PayoutSection isApproved={isApproved} />}
    </div>
  )
}
