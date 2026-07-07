import { Loader2, SearchX } from "lucide-react"
import StatusBadge from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
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
import type { OrderChannel, OrderPaymentStatus, OrderSummary } from "@/redux/api/ordersApi"
import { CHANNEL_CONFIG, PAYMENT_CONFIG, formatNaira } from "./constants"

function ChannelBadge({ channel }: { channel: OrderChannel }) {
  const cfg = CHANNEL_CONFIG[channel]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  )
}

function PaymentBadge({ status }: { status: OrderPaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="pl-5 pr-4"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="px-4"><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="px-4"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
          <TableCell className="px-4"><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell className="px-4"><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
          <TableCell className="px-4"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell className="pl-4 pr-5"><Skeleton className="h-4 w-14" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

interface OrdersTableProps {
  orders: OrderSummary[]
  isLoading: boolean
  isFetching?: boolean
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onRowClick: (orderId: string) => void
}

export default function OrdersTable({
  orders,
  isLoading,
  isFetching = false,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onRowClick,
}: OrdersTableProps) {
  const isRefreshing = isFetching && !isLoading

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-1.5">
                Order Ref
                {isRefreshing && <Loader2 className="size-3 animate-spin" />}
              </span>
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Customer
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Channel
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Amount
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payment
            </TableHead>
            <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="pl-4 pr-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={cn(isRefreshing && "opacity-60 transition-opacity")}>
          {isLoading ? (
            <SkeletonRows />
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                  <SearchX className="size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No orders found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">Try adjusting your filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onRowClick(order.id)}
              >
                <TableCell className="pl-5 pr-4 text-sm font-medium text-foreground">
                  {order.reference_id}
                </TableCell>
                <TableCell className="px-4 text-sm text-foreground">{order.customer_name}</TableCell>
                <TableCell className="px-4">
                  <ChannelBadge channel={order.channel} />
                </TableCell>
                <TableCell className="px-4 text-sm font-medium tabular-nums text-foreground">
                  {formatNaira(order.amount)}
                </TableCell>
                <TableCell className="px-4">
                  <PaymentBadge status={order.payment_status} />
                </TableCell>
                <TableCell className="px-4">
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="pl-4 pr-5 text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isLoading && orders.length > 0 && (
        <div className="px-5 pb-4">
          <TablePagination currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
