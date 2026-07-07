import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DateRangePicker, { type DateRangeValue } from "@/components/shared/DateRangePicker"
import type { TransactionStatus } from "@/redux/api/transactionsApi"

export type StatusFilter = "all" | TransactionStatus

const ALL_STATUSES: TransactionStatus[] = ["pending", "success", "failed", "refunded"]

const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: "Pending",
  success: "Success",
  failed: "Failed",
  refunded: "Refunded",
}

interface TransactionFiltersProps {
  status: StatusFilter
  onStatusChange: (v: StatusFilter) => void
  search: string
  onSearchChange: (v: string) => void
  dateRange: DateRangeValue
  onDateRangeChange: (v: DateRangeValue) => void
}

export default function TransactionFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: TransactionFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger className="w-[160px]">
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

      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

      <div className="relative ml-auto">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="w-64 pl-9"
          placeholder="Search by reference"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
