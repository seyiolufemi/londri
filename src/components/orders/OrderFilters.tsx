import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DateRangePicker, { type DateRangeValue } from "@/components/shared/DateRangePicker"
import type { OrderChannel, OrderPaymentStatus, OrderStatus } from "@/redux/api/ordersApi"
import { CHANNEL_CONFIG, PAYMENT_CONFIG, STATUS_LABELS } from "./constants"

export type StatusFilter = "all" | OrderStatus
export type ChannelFilter = "all" | OrderChannel
export type PaymentFilter = "all" | OrderPaymentStatus

const ALL_STATUSES: OrderStatus[] = [
  "requested",
  "confirmed",
  "picked_up",
  "in_progress",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
]
const ALL_CHANNELS: OrderChannel[] = ["online_booking", "walk_in", "subscription_fulfillment"]
const ALL_PAYMENT_STATUSES: OrderPaymentStatus[] = ["pending", "paid", "refunded"]

interface OrderFiltersProps {
  status: StatusFilter
  channel: ChannelFilter
  payment: PaymentFilter
  dateRange: DateRangeValue
  search: string
  onStatusChange: (v: StatusFilter) => void
  onChannelChange: (v: ChannelFilter) => void
  onPaymentChange: (v: PaymentFilter) => void
  onDateRangeChange: (v: DateRangeValue) => void
  onSearchChange: (v: string) => void
}

export default function OrderFilters({
  status,
  channel,
  payment,
  dateRange,
  search,
  onStatusChange,
  onChannelChange,
  onPaymentChange,
  onDateRangeChange,
  onSearchChange,
}: OrderFiltersProps) {
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = []
  if (status !== "all")
    activeFilters.push({ key: "status", label: STATUS_LABELS[status], onRemove: () => onStatusChange("all") })
  if (channel !== "all")
    activeFilters.push({
      key: "channel",
      label: CHANNEL_CONFIG[channel].label,
      onRemove: () => onChannelChange("all"),
    })
  if (payment !== "all")
    activeFilters.push({
      key: "payment",
      label: PAYMENT_CONFIG[payment].label,
      onRemove: () => onPaymentChange("all"),
    })

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={channel} onValueChange={(v) => onChannelChange(v as ChannelFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {ALL_CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>
                {CHANNEL_CONFIG[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={payment} onValueChange={(v) => onPaymentChange(v as PaymentFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {ALL_PAYMENT_STATUSES.map((p) => (
              <SelectItem key={p} value={p}>
                {PAYMENT_CONFIG[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-64 pl-9"
            placeholder="Search by order reference"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
            >
              {f.label}
              <button onClick={f.onRemove} className="ml-1 rounded-full hover:text-destructive">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
