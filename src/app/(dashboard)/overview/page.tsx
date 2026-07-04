"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  Package,
  CheckCircle2,
  Users,
  Lock,
  Plus,
  ClipboardList,
  Tag,
  Wallet,
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
import { useStore } from "@/lib/mock/store"
import { useKybStatus } from "@/lib/hooks/useKybStatus"
import StatusBadge from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
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

type DateFilter = "today" | "this_week" | "this_month" | "last_3_months"

interface ChartPoint {
  label: string
  amount: number
}

const CHART_DATA: Record<DateFilter, ChartPoint[]> = {
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
}

function getDateRange(filter: DateFilter): { start: Date; end: Date } {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (filter === "today") {
    return { start: startOfToday, end: now }
  }
  if (filter === "this_week") {
    const day = startOfToday.getDay()
    const diffToMon = day === 0 ? 6 : day - 1
    const mon = new Date(startOfToday)
    mon.setDate(startOfToday.getDate() - diffToMon)
    return { start: mon, end: now }
  }
  if (filter === "this_month") {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
  }
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return { start, end: now }
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
}

function StatCard({ label, value, icon: Icon, locked }: StatCardProps) {
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
      <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
        {locked ? "—" : value}
      </p>
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
        <p className="text-xs text-muted-foreground">{description}</p>
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
  const { kybStatus } = useKybStatus()
  const [dateFilter, setDateFilter] = useState<DateFilter>("this_month")
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const transactions = useStore((s) => s.transactions)
  const orders = useStore((s) => s.orders)
  const customerSubscriptions = useStore((s) => s.customerSubscriptions)

  const locked = kybStatus !== "approved"

  const { start, end } = useMemo(() => getDateRange(dateFilter), [dateFilter])

  const totalRevenue = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.status === "successful" &&
          t.type !== "refund" &&
          new Date(t.createdAt) >= start &&
          new Date(t.createdAt) <= end
      )
      .reduce((s, t) => s + t.amount, 0)
  }, [transactions, start, end])

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length,
    [orders]
  )

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "completed" &&
          o.actualDeliveryDate != null &&
          new Date(o.actualDeliveryDate) >= start &&
          new Date(o.actualDeliveryDate) <= end
      ).length,
    [orders, start, end]
  )

  const activeSubscribers = useMemo(
    () => customerSubscriptions.filter((s) => s.status === "active").length,
    [customerSubscriptions]
  )

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders]
  )

  const chartData = CHART_DATA[dateFilter]
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

        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatNaira(totalRevenue)} icon={TrendingUp} locked={locked} />
        <StatCard label="Active Orders" value={activeOrders} icon={Package} locked={locked} />
        <StatCard label="Completed Orders" value={completedOrders} icon={CheckCircle2} locked={locked} />
        <StatCard label="Active Subscribers" value={activeSubscribers} icon={Users} locked={locked} />
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

          {locked ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-lg bg-muted/30">
              <Lock className="size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Complete verification to unlock analytics
              </p>
            </div>
          ) : (
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
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--muted)" }}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              label="New Walk-in Order"
              description="Create an order for a walk-in customer"
              icon={Plus}
              locked={locked}
              onClick={locked ? handleLockedAction : () => router.push("/orders/new")}
            />
            <QuickAction
              label="Manage Orders"
              description="View and update all active orders"
              icon={ClipboardList}
              locked={locked}
              onClick={locked ? handleLockedAction : () => router.push("/orders")}
            />
            <QuickAction
              label="Update Price List"
              description="Add or edit your service prices"
              icon={Tag}
              locked={locked}
              onClick={locked ? handleLockedAction : () => router.push("/price-list")}
            />
            <QuickAction
              label="Withdraw Balance"
              description="Transfer your available balance to your bank"
              icon={Wallet}
              locked={locked}
              onClick={locked ? handleLockedAction : () => setWithdrawOpen(true)}
            />
          </div>
        </div>
      </div>

      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />

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
              {recentOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <TableCell className="pl-5 pr-4 text-sm font-medium text-foreground">
                    {order.reference}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="px-4 text-right text-sm font-medium text-foreground">
                    {formatNaira(order.totalAmount)}
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="pl-4 pr-5 text-right text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
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
