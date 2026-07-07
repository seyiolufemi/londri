import { Package, CheckCircle2, XCircle, DollarSign, type LucideIcon } from "lucide-react"
import type { OrderStats } from "@/redux/api/ordersApi"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNaira } from "./constants"

interface OrderStatCardsProps {
  stats: OrderStats | undefined
  isLoading: boolean
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export default function OrderStatCards({ stats, isLoading }: OrderStatCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-4 gap-4">
      <StatCard label="Active Orders" value={stats?.active_orders ?? 0} icon={Package} />
      <StatCard label="Completed Orders" value={stats?.completed_orders ?? 0} icon={CheckCircle2} />
      <StatCard label="Cancelled Orders" value={stats?.cancelled_orders ?? 0} icon={XCircle} />
      <StatCard label="Total Order Value" value={formatNaira(stats?.total_order_value ?? 0)} icon={DollarSign} />
    </div>
  )
}
