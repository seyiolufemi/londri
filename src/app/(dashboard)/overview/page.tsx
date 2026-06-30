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
  type LucideIcon,
} from "lucide-react"
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

type DateFilter = "today" | "this_week" | "this_month" | "last_3_months"

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_3_months", label: "Last 3 Months" },
]

interface ChartPoint {
  label: string
  amount: number
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

function getChartData(
  filter: DateFilter,
  transactions: { createdAt: string; amount: number; status: string; type: string }[]
): ChartPoint[] {
  const successful = transactions.filter(
    (t) => t.status === "successful" && t.type !== "refund"
  )

  if (filter === "today") {
    return [6, 8, 10, 12, 14, 16, 18, 20, 22].map((hour) => ({
      label: `${hour}:00`,
      amount: successful
        .filter((t) => {
          const d = new Date(t.createdAt)
          const now = new Date()
          return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate() &&
            d.getHours() >= hour &&
            d.getHours() < hour + 2
          )
        })
        .reduce((s, t) => s + t.amount, 0),
    }))
  }

  if (filter === "this_week") {
    const now = new Date()
    const day = now.getDay()
    const diffToMon = day === 0 ? 6 : day - 1
    const monDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMon)
    const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return DAY_LABELS.map((label, i) => {
      const d = new Date(monDate)
      d.setDate(monDate.getDate() + i)
      return {
        label,
        amount: successful
          .filter((t) => {
            const td = new Date(t.createdAt)
            return (
              td.getFullYear() === d.getFullYear() &&
              td.getMonth() === d.getMonth() &&
              td.getDate() === d.getDate()
            )
          })
          .reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  if (filter === "this_month") {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const numWeeks = Math.ceil(daysInMonth / 7)
    return Array.from({ length: numWeeks }, (_, i) => {
      const weekStart = i * 7 + 1
      const weekEnd = Math.min((i + 1) * 7, daysInMonth)
      return {
        label: `Week ${i + 1}`,
        amount: successful
          .filter((t) => {
            const td = new Date(t.createdAt)
            return (
              td.getFullYear() === now.getFullYear() &&
              td.getMonth() === now.getMonth() &&
              td.getDate() >= weekStart &&
              td.getDate() <= weekEnd
            )
          })
          .reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  const now = new Date()
  return [-2, -1, 0].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    return {
      label: d.toLocaleString("default", { month: "short" }),
      amount: successful
        .filter((t) => {
          const td = new Date(t.createdAt)
          return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
        })
        .reduce((s, t) => s + t.amount, 0),
    }
  })
}

function formatNaira(amount: number): string {
  return "\u20a6" + amount.toLocaleString("en-NG")
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  locked: boolean
  trend?: string
}

function StatCard({ label, value, icon: Icon, locked, trend }: StatCardProps) {
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
            <Icon className="size-4 text-primary" />
          )}
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">
        {locked ? "\u2014" : value}
      </p>
      {trend && !locked && (
        <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
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
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {locked ? (
          <Lock className="size-4 text-primary/60" />
        ) : (
          <Icon className="size-4 text-primary" />
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
    () => orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
    [orders]
  )

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "delivered" &&
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

  const chartData = useMemo(
    () => getChartData(dateFilter, transactions),
    [dateFilter, transactions]
  )

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders]
  )

  function handleLockedAction() {
    toast.warning("Verification required", {
      description: "Complete KYB verification to access this feature.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Good morning
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your laundry business.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                dateFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatNaira(totalRevenue)}
          icon={TrendingUp}
          locked={locked}
        />
        <StatCard
          label="Active Orders"
          value={activeOrders}
          icon={Package}
          locked={locked}
          trend={`${activeOrders} order${activeOrders !== 1 ? "s" : ""} in progress`}
        />
        <StatCard
          label="Completed Orders"
          value={completedOrders}
          icon={CheckCircle2}
          locked={locked}
          trend={completedOrders === 0 ? "None in this period" : undefined}
        />
        <StatCard
          label="Active Subscribers"
          value={activeSubscribers}
          icon={Users}
          locked={locked}
          trend={`${activeSubscribers} active plan${activeSubscribers !== 1 ? "s" : ""}`}
        />
      </div>

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
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
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
                  tickFormatter={(v: number) => (v >= 1000 ? `\u20a6${v / 1000}k` : `\u20a6${v}`)}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", radius: 4 }} />
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
              onClick={locked ? handleLockedAction : () => router.push("/walk-in")}
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
          </div>
        </div>
      </div>

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
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{order.reference}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-foreground">
                    {formatNaira(order.totalAmount)}
                  </span>
                  <StatusBadge status={order.status} />
                  <span className="w-20 text-right text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
