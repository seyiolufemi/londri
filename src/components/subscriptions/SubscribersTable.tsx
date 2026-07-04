import { Users } from "lucide-react"
import type { CustomerSubscription, SubscriptionStatus } from "@/types"
import type { SubscriptionPlan } from "@/redux/api/catalogApi"
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
import StatusBadge from "./StatusBadge"
import UsageBar from "./UsageBar"

interface SubscribersTableProps {
  plans: SubscriptionPlan[]
  subscribers: CustomerSubscription[]
  planFilter: string
  onPlanFilterChange: (value: string) => void
  statusFilter: SubscriptionStatus | "all"
  onStatusFilterChange: (value: SubscriptionStatus | "all") => void
  onViewSubscriber: (id: string) => void
}

export default function SubscribersTable({
  plans,
  subscribers,
  planFilter,
  onPlanFilterChange,
  statusFilter,
  onStatusFilterChange,
  onViewSubscriber,
}: SubscribersTableProps) {
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={planFilter} onValueChange={onPlanFilterChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {plans.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as SubscriptionStatus | "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="size-7 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No subscribers found
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Plan
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Usage This Cycle
                </TableHead>
                <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next Billing
                </TableHead>
                <TableHead className="pl-4 pr-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="pl-5 pr-4">
                    <p className="text-sm font-medium text-foreground">
                      {sub.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.customerPhone}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 text-sm text-foreground">
                    {sub.planName}
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="px-4">
                    <p className="text-sm tabular-nums text-foreground">
                      {sub.creditsUsed}/{sub.creditsTotal} items
                    </p>
                    <UsageBar used={sub.creditsUsed} total={sub.creditsTotal} />
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {new Date(sub.nextBillingDate).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="pl-4 pr-5">
                    <button
                      className="text-sm font-medium text-primary hover:underline"
                      onClick={() => onViewSubscriber(sub.id)}
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  )
}
