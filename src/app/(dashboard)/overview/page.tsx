"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  TrendingUp,
  Package,
  CheckCircle2,
  Lock,
  Plus,
  Tag,
  Wallet,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import WithdrawDialog from "@/components/shared/WithdrawDialog"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { toast } from "sonner"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import { useListOrdersQuery, type ListOrdersParams, type Period } from "@/redux/api/ordersApi"
import { useListTransactionsQuery } from "@/redux/api/transactionsApi"
import { PAYOUTS_ENABLED } from "@/lib/featureFlags"
import StatusBadge from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import DateRangePicker, { type DateRangeValue, type PresetKey } from "@/components/shared/DateRangePicker"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const RECENT_ORDERS_LIMIT = 5

function toPeriodParams(range: DateRangeValue): Pick<ListOrdersParams, "period" | "start_date" | "end_date"> {
  if (typeof range === "string") return { period: range as Period }
  return {
    period: "custom",
    start_date: format(range.from, "yyyy-MM-dd"),
    end_date: format(range.to, "yyyy-MM-dd"),
  }
}

interface ChartPoint {
  label: string
  amount: number
}

const CHART_DATA: Record<PresetKey, ChartPoint[]> = {
  today: [
    { label: "8am", amount: 2000 },
    { label: "9am", amount: 5500 },
    { label: "10am", amount: 8000 },
    { label: "11am", amount: 12000 },
    { label: "12pm", amount: 18000 },
    { label: "1pm", amount: 15000 },
    { label: "2pm", amount: 11000 },
    { label: "3pm", amount: 9000 },
    { label: "4pm", amount: 14000 },
    { label: "5pm", amount: 7500 },
    { label: "6pm", amount: 4000 },
    { label: "7pm", amount: 3000 },
  ],
  this_week: [
    { label: "Mon", amount: 45000 },
    { label: "Tue", amount: 62000 },
    { label: "Wed", amount: 85000 },
    { label: "Thu", amount: 38000 },
    { label: "Fri", amount: 71000 },
    { label: "Sat", amount: 25000 },
    { label: "Sun", amount: 8000 },
  ],
  this_month: [
    { label: "Week 1", amount: 280000 },
    { label: "Week 2", amount: 380000 },
    { label: "Week 3", amount: 120000 },
    { label: "Week 4", amount: 210000 },
  ],
  last_3_months: [
    { label: "April", amount: 820000 },
    { label: "May", amount: 1100000 },
    { label: "June", amount: 1400000 },
  ],
  all_time: [
    { label: "Jan", amount: 650000 },
    { label: "Feb", amount: 820000 },
    { label: "Mar", amount: 940000 },
    { label: "Apr", amount: 820000 },
    { label: "May", amount: 1100000 },
    { label: "Jun", amount: 1400000 },
  ],
}

function hashLabel(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function mockAmount(seed: string, scale: number): number {
  const pct = 0.2 + (hashLabel(seed) % 81) / 100
  return Math.round((pct * scale) / 1000) * 1000
}

function getCustomChartData(from: Date, to: Date): ChartPoint[] {
  const diffDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)))

  if (diffDays <= 1) return CHART_DATA.today

  if (diffDays <= 14) {
    const points: ChartPoint[] = []
    const cur = new Date(from)
    while (cur <= to && points.length < 14) {
      const label = cur.toLocaleDateString("en-NG", { month: "short", day: "numeric" })
      points.push({ label, amount: mockAmount(label, 80000) })
      cur.setDate(cur.getDate() + 1)
    }
    return points
  }

  if (diffDays <= 90) {
    const points: ChartPoint[] = []
    const cur = new Date(from)
    let weekNum = 1
    while (cur <= to) {
      const label = `Wk ${weekNum}`
      points.push({ label, amount: mockAmount(label + String(cur.getMonth()), 400000) })
      cur.setDate(cur.getDate() + 7)
      weekNum++
    }
    return points
  }

  const points: ChartPoint[] = []
  const cur = new Date(from.getFullYear(), from.getMonth(), 1)
  const last = new Date(to.getFullYear(), to.getMonth(), 1)
  while (cur <= last) {
    const label = cur.toLocaleDateString("en-NG", { month: "short", year: "2-digit" })
    points.push({ label, amount: mockAmount(label, 1500000) })
    cur.setMonth(cur.getMonth() + 1)
  }
  return points
}

function getChartData(value: DateRangeValue): ChartPoint[] {
  if (typeof value === "string") return CHART_DATA[value]
  return getCustomChartData(value.from, value.to)
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  locked: boolean
  isLoading?: boolean
}

function StatCard({ label, value, icon: Icon, locked, isLoading }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-5 transition-opacity",
        locked && "opacity-60"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          {locked ? (
            <Lock className="size-4 text-muted-foreground" />
          ) : (
            <Icon className="size-4 text-muted-foreground" />
          )}
        </div>
      </div>
      {locked ? (
        <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">—</p>
      ) : isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
          {value}
        </p>
      )}
    </div>
  )
}

interface QuickActionProps {
  label: string
  description: string
  icon: LucideIcon
  onClick: () => void
  locked: boolean
}

function QuickAction({ label, description, icon: Icon, onClick, locked }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted/50",
        locked && "cursor-not-allowed opacity-60"
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        {locked ? (
          <Lock className="size-[18px] text-foreground" />
        ) : (
          <Icon className="size-[18px] text-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{formatNaira(payload[0].value)}</p>
    </div>
  )
}

export default function OverviewPage() {
  const router = useRouter()
  const { data: business } = useGetMyBusinessQuery()
  const [dateFilter, setDateFilter] = useState<DateRangeValue>("this_month")
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const locked = business?.current_kyb_status !== "verified"

  const ordersParams: ListOrdersParams = {
    ...toPeriodParams(dateFilter),
    limit: RECENT_ORDERS_LIMIT,
    offset: 0,
  }
  const { data: ordersData, isLoading: ordersLoading } = useListOrdersQuery(ordersParams)
  const stats = ordersData?.stats
  const recentOrders = ordersData?.orders ?? []
  const totalRevenue = stats?.total_order_value ?? 0
  const activeOrders = stats?.active_orders ?? 0
  const completedOrders = stats?.completed_orders ?? 0

  const { data: transactionsData, isLoading: balanceLoading } = useListTransactionsQuery({ limit: 1 })
  const availableBalance = transactionsData?.available_balance ?? 0

  const chartData = getChartData(dateFilter)
  const yDomain: [number, number] = [0, Math.ceil(Math.max(1, ...chartData.map((d) => d.amount)) * 1.2 / 1000) * 1000]
  const greeting = getGreeting()

  function handleLockedAction() {
    toast.warning("Verification required", {
      description: "Complete KYB verification to access this feature.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            {greeting}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your laundry business.
          </p>
        </div>

        <DateRangePicker value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Available Balance — always live, not filtered by date range */}
        <div className="relative overflow-hidden rounded-xl bg-primary p-5 bg-pattern-diagonal">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-white/70">Available Balance</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
              <Wallet className="size-[18px] text-white/70" />
            </div>
          </div>
          {locked ? (
            <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-white">—</p>
          ) : balanceLoading ? (
            <Skeleton className="h-8 w-24 bg-white/20" />
          ) : (
            <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-white">
              {formatNaira(availableBalance)}
            </p>
          )}
          {!locked && PAYOUTS_ENABLED && (
            <button
              onClick={() => setWithdrawOpen(true)}
              className="mt-1 text-xs text-white/90 cursor-pointer hover:underline"
            >
              Withdraw →
            </button>
          )}
        </div>

        <StatCard
          label="Total Revenue"
          value={formatNaira(totalRevenue)}
          icon={TrendingUp}
          locked={locked}
          isLoading={ordersLoading}
        />
        <StatCard
          label="Active Orders"
          value={activeOrders}
          icon={Package}
          locked={locked}
          isLoading={ordersLoading}
        />
        <StatCard
          label="Completed Orders"
          value={completedOrders}
          icon={CheckCircle2}
          locked={locked}
          isLoading={ordersLoading}
        />
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-xl border border-border bg-background p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
            <p className="text-xs text-muted-foreground">
              {locked
                ? "Complete KYB verification to view revenue data"
                : `${formatNaira(totalRevenue)} this period`}
            </p>
          </div>

          {/* Chart visualization isn't wired to real data yet — shown blurred as a preview,
              with its own "Coming Soon" overlay independent of KYB lock state. */}
          <div className="relative">
            <div className="pointer-events-none select-none blur-sm">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  barSize={28}
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v: number) =>
                      v >= 1000000
                        ? `₦${v / 1000000}m`
                        : v >= 1000
                        ? `₦${v / 1000}k`
                        : `₦${v}`
                    }
                    width={52}
                    domain={yDomain}
                    tickCount={5}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-sm font-medium text-foreground shadow-sm">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-background p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              label="Create New Order"
              description="Create an order for a walk-in or subscription customer"
              icon={Plus}
              locked={locked}
              onClick={locked ? handleLockedAction : () => router.push("/orders/new")}
            />
            <QuickAction
              label="Update Price List"
              description="Add or edit your service prices"
              icon={Tag}
              locked={locked}
              onClick={locked ? handleLockedAction : () => router.push("/price-list")}
            />
            {PAYOUTS_ENABLED && (
              <QuickAction
                label="Withdraw Balance"
                description="Transfer your available balance to your bank"
                icon={Wallet}
                locked={locked}
                onClick={locked ? handleLockedAction : () => setWithdrawOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {PAYOUTS_ENABLED && <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />}

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
          <button
            className="text-xs font-medium text-primary hover:underline"
            onClick={locked ? handleLockedAction : () => router.push("/orders")}
          >
            View all
          </button>
        </div>

        {locked ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-10">
            <Lock className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Complete KYB verification to view orders
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5 pl-5 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Order ID
                </TableHead>
                <TableHead className="w-1/5 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="w-1/5 px-4 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="w-1/10 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-1/10 pl-4 pr-5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                Array.from({ length: RECENT_ORDERS_LIMIT }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-5 pr-4"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="px-4"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="px-4 text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                    <TableCell className="px-4"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell className="pl-4 pr-5 text-right"><Skeleton className="ml-auto h-4 w-14" /></TableCell>
                  </TableRow>
                ))
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <ShoppingBag className="mx-auto size-7 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No orders yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Orders will appear here once created
                    </p>
                  </TableCell>
                </TableRow>
              ) : recentOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => router.push(`/orders?orderId=${order.id}`)}
                >
                  <TableCell className="pl-5 pr-4 text-sm font-medium text-foreground">
                    {order.reference_id}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {order.customer_name}
                  </TableCell>
                  <TableCell className="px-4 text-right text-sm font-medium text-foreground">
                    {formatNaira(order.amount)}
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="pl-4 pr-5 text-right text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
