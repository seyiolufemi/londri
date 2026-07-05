"use client"

import { useState, useMemo, type ReactNode } from "react"
import { Wallet } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import type { Transaction, Payout } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import WithdrawDialog from "@/components/shared/WithdrawDialog"
import DateRangePicker, {
  isDateInRange,
  type DateRangeValue,
} from "@/components/shared/DateRangePicker"
import TablePagination, { paginate } from "@/components/shared/TablePagination"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatChannel(channel: string): string {
  const map: Record<string, string> = {
    card: "Card",
    bank_transfer: "Bank Transfer",
    ussd: "USSD",
    cash: "Cash",
  }
  return map[channel] ?? channel
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: Transaction["type"] }) {
  const styles: Record<Transaction["type"], string> = {
    payment: "bg-green-500/10 text-green-600 dark:text-green-400",
    refund: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    subscription: "bg-primary/10 text-primary",
    payout: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }
  const labels: Record<Transaction["type"], string> = {
    payment: "Payment",
    refund: "Refund",
    subscription: "Subscription",
    payout: "Payout",
  }
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        styles[type]
      )}
    >
      {labels[type]}
    </span>
  )
}

// ─── Match Status Badge ───────────────────────────────────────────────────────

function MatchBadge({ status }: { status: "matched" | "unmatched" }) {
  return status === "matched" ? (
    <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
      Matched
    </span>
  ) : (
    <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
      Unmatched
    </span>
  )
}

// ─── Payout Status Badge ──────────────────────────────────────────────────────

function PayoutBadge({ status }: { status: Payout["status"] }) {
  const styles: Record<Payout["status"], string> = {
    processing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed: "bg-green-500/10 text-green-600 dark:text-green-400",
    failed: "bg-destructive/10 text-destructive",
  }
  const labels: Record<Payout["status"], string> = {
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
  }
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  )
}

// ─── Resolve Dialog ───────────────────────────────────────────────────────────

interface ResolveDialogProps {
  transaction: Transaction | null
  onOpenChange: (v: boolean) => void
}

function ResolveDialog({ transaction, onOpenChange }: ResolveDialogProps) {
  const resolveTransaction = useStore((s) => s.resolveTransaction)
  const [note, setNote] = useState("")

  function handleResolve() {
    if (!transaction) return
    resolveTransaction(transaction.id, note)
    toast.success("Transaction marked as resolved")
    onOpenChange(false)
    setNote("")
  }

  return (
    <Dialog
      open={!!transaction}
      onOpenChange={(v) => {
        if (!v) {
          onOpenChange(false)
          setNote("")
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve Transaction</DialogTitle>
          <DialogDescription>
            Review the details and add a resolution note to mark this transaction as matched.
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-foreground">{transaction.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <TypeBadge type={transaction.type} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatNaira(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="text-foreground">{transaction.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="text-foreground">{formatChannel(transaction.channel)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{formatDate(transaction.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resolve-note">Resolution Note</Label>
              <Textarea
                id="resolve-note"
                placeholder="Describe how this was resolved or verified..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolve}>Mark as Resolved</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  action?: ReactNode
}

function StatCard({ label, value, icon, action }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
      </div>
      <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
      {action}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export default function TransactionsPage() {
  const { data: business } = useGetMyBusinessQuery()
  const transactions = useStore((s) => s.transactions)
  const orders = useStore((s) => s.orders)
  const payouts = useStore((s) => s.payouts)
  const availableBalance = useStore((s) => s.availableBalance)
  const totalPaidOut = useStore((s) => s.totalPaidOut)

  const isApproved = business?.current_kyb_status === "verified"

  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState("all")
  const [matchFilter, setMatchFilter] = useState("all")
  const [dateRangeValue, setDateRangeValue] = useState<DateRangeValue>("this_month")
  const [resolvingTxn, setResolvingTxn] = useState<Transaction | null>(null)

  // Separate pagination states for each table
  const [txnPage, setTxnPage] = useState(1)
  const [payoutPage, setPayoutPage] = useState(1)
  const [payoutDateRange, setPayoutDateRange] = useState<DateRangeValue>("this_month")

  // Order reference lookup
  const orderRefMap = useMemo(() => {
    const map: Record<string, string> = {}
    orders.forEach((o) => { map[o.id] = o.reference })
    return map
  }, [orders])

  const filtered = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((t) => {
        if (typeFilter !== "all" && t.type !== typeFilter) return false
        if (matchFilter === "matched" && t.matchStatus !== "matched") return false
        if (matchFilter === "unmatched" && t.matchStatus !== "unmatched") return false
        if (!isDateInRange(new Date(t.createdAt), dateRangeValue)) return false
        return true
      })
  }, [transactions, typeFilter, matchFilter, dateRangeValue])

  const pagedTxns = paginate(filtered, txnPage, PAGE_SIZE)

  const sortedPayouts = useMemo(
    () =>
      [...payouts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [payouts]
  )

  const filteredPayouts = useMemo(
    () => sortedPayouts.filter((p) => isDateInRange(new Date(p.createdAt), payoutDateRange)),
    [sortedPayouts, payoutDateRange]
  )

  const pagedPayouts = paginate(filteredPayouts, payoutPage, PAGE_SIZE)

  function handleWithdrawClick() {
    if (!isApproved) {
      toast.warning("Verification required", {
        description: "Complete KYB verification to withdraw your balance.",
      })
      return
    }
    setWithdrawOpen(true)
  }

  function handleTypeFilter(v: string) {
    setTypeFilter(v)
    setTxnPage(1)
  }

  function handleMatchFilter(v: string) {
    setMatchFilter(v)
    setTxnPage(1)
  }

  function handleDateRangeChange(v: DateRangeValue) {
    setDateRangeValue(v)
    setTxnPage(1)
  }

  function handlePayoutDateRangeChange(v: DateRangeValue) {
    setPayoutDateRange(v)
    setPayoutPage(1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Transactions
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track payments and manage payouts
          </p>
        </div>
        <Button onClick={handleWithdrawClick}>
          <Wallet className="mr-1.5 size-4" />
          Withdraw Balance
        </Button>
      </div>

      {/* Available Balance — single standalone card */}
      <div className="max-w-xs">
        <StatCard
          label="Available Balance"
          value={formatNaira(availableBalance)}
          icon={<Wallet className="size-4 text-muted-foreground" />}
          action={
            <button
              onClick={handleWithdrawClick}
              className="mt-1 cursor-pointer text-xs text-primary hover:underline"
            >
              Withdraw →
            </button>
          }
        />
      </div>

      {/* Section 1 — Transactions */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">Transactions</h2>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={typeFilter} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="payout">Payout</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>

          <Select value={matchFilter} onValueChange={handleMatchFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker
            value={dateRangeValue}
            onChange={handleDateRangeChange}
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reference
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Linked Order
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Channel
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Match Status
                </TableHead>
                <TableHead className="pr-5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No transactions match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedTxns.map((txn) => (
                  <TableRow
                    key={txn.id}
                    className={cn(
                      "transition-colors",
                      txn.matchStatus === "unmatched" &&
                        "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => {
                      if (txn.matchStatus === "unmatched") setResolvingTxn(txn)
                    }}
                  >
                    <TableCell className="pl-5 font-mono text-sm text-muted-foreground">
                      {txn.reference}
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={txn.type} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {txn.orderId ? (
                        <span className="cursor-pointer text-primary">
                          {orderRefMap[txn.orderId] ?? txn.orderId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                      {formatNaira(txn.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatChannel(txn.channel)}
                    </TableCell>
                    <TableCell>
                      <MatchBadge status={txn.matchStatus} />
                    </TableCell>
                    <TableCell className="pr-5 text-right text-sm text-muted-foreground">
                      {formatDate(txn.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filtered.length > 0 && (
            <div className="px-5 pb-4">
              <TablePagination
                currentPage={txnPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setTxnPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 2 — Payout History */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Payout History</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatNaira(totalPaidOut)} total paid out
            </p>
          </div>
          <DateRangePicker value={payoutDateRange} onChange={handlePayoutDateRangeChange} />
        </div>

        <div className="rounded-xl border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="pr-5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bank Reference
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No payouts yet.
                  </TableCell>
                </TableRow>
              ) : (
                pagedPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="pl-5 text-sm text-muted-foreground">
                      {formatDate(payout.createdAt)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                      {formatNaira(payout.amount)}
                    </TableCell>
                    <TableCell>
                      <PayoutBadge status={payout.status} />
                    </TableCell>
                    <TableCell className="pr-5 text-right font-mono text-sm text-muted-foreground">
                      {payout.bankReference}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredPayouts.length > 0 && (
            <div className="px-5 pb-4">
              <TablePagination
                currentPage={payoutPage}
                totalItems={filteredPayouts.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPayoutPage}
              />
            </div>
          )}
        </div>
      </div>

      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />

      <ResolveDialog
        transaction={resolvingTxn}
        onOpenChange={(v) => !v && setResolvingTxn(null)}
      />
    </div>
  )
}
