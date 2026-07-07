import { Loader2 } from "lucide-react"
import StatusBadge from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import TablePagination from "@/components/shared/TablePagination"
import type { Transaction } from "@/redux/api/transactionsApi"
import { cn } from "@/lib/utils"
import { formatDate, formatNaira, formatPaymentChannel } from "./constants"

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="pl-5"><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
          <TableCell className="pr-5 text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  isFetching?: boolean
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

export default function TransactionsTable({
  transactions,
  isLoading,
  isFetching = false,
  page,
  pageSize,
  totalItems,
  onPageChange,
}: TransactionsTableProps) {
  const isRefreshing = isFetching && !isLoading

  return (
    <div className="rounded-xl border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-1.5">
                Reference
                {isRefreshing && <Loader2 className="size-3 animate-spin" />}
              </span>
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order
            </TableHead>
            <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Amount
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Channel
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="pr-5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={cn(isRefreshing && "opacity-60 transition-opacity")}>
          {isLoading ? (
            <SkeletonRows />
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                No transactions match your filters.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="pl-5 font-mono text-sm text-muted-foreground">
                  {txn.reference_id}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {txn.order_id.slice(0, 8)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                  {formatNaira(txn.amount)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatPaymentChannel(txn.payment_channel)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={txn.status} />
                </TableCell>
                <TableCell className="pr-5 text-right text-sm text-muted-foreground">
                  {formatDate(txn.paid_at ?? txn.created_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isLoading && transactions.length > 0 && (
        <div className="px-5 pb-4">
          <TablePagination currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
