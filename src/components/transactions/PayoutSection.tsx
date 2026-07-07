"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import StatusBadge from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import WithdrawDialog from "@/components/shared/WithdrawDialog"
import DateRangePicker, { isDateInRange, type DateRangeValue } from "@/components/shared/DateRangePicker"
import TablePagination, { paginate } from "@/components/shared/TablePagination"
import { formatDate, formatNaira } from "./constants"

const PAGE_SIZE = 10

// Mock — no payouts/withdrawal endpoint exists yet. Kept behind the flag in
// transactions/page.tsx until the backend confirms one.
export default function PayoutSection({ isApproved }: { isApproved: boolean }) {
  const payouts = useStore((s) => s.payouts)
  const totalPaidOut = useStore((s) => s.totalPaidOut)

  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [payoutPage, setPayoutPage] = useState(1)
  const [payoutDateRange, setPayoutDateRange] = useState<DateRangeValue>("this_month")

  const sortedPayouts = useMemo(
    () => [...payouts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Payout History</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatNaira(totalPaidOut)} total paid out</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={payoutDateRange} onChange={setPayoutDateRange} />
          <Button onClick={handleWithdrawClick}>Withdraw Balance</Button>
        </div>
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
                <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
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
                    <StatusBadge status={payout.status} />
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

      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </div>
  )
}
