"use client"

import { useState } from "react"
import { format, startOfToday, startOfWeek, startOfMonth, subMonths, endOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export type PresetKey = "today" | "this_week" | "this_month" | "last_3_months" | "all_time"
export type SidebarKey = PresetKey | "custom"
export type DateRangeValue = PresetKey | { from: Date; to: Date }

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_LABELS: Record<PresetKey, string> = {
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
  last_3_months: "Last 3 Months",
  all_time: "All Time",
}

const DEFAULT_PRESETS: Array<{ key: SidebarKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_3_months", label: "Last 3 Months" },
  { key: "all_time", label: "All Time" },
  { key: "custom", label: "Custom Range" },
]

// ─── Utility functions ────────────────────────────────────────────────────────

function getPresetRange(preset: PresetKey): { start: Date; end: Date } {
  const now = new Date()
  const today = startOfToday()
  switch (preset) {
    case "today":
      return { start: today, end: now }
    case "this_week":
      return { start: startOfWeek(today, { weekStartsOn: 1 }), end: now }
    case "this_month":
      return { start: startOfMonth(today), end: now }
    case "last_3_months":
      return { start: startOfMonth(subMonths(today, 2)), end: now }
    case "all_time":
      return { start: new Date(2020, 0, 1), end: now }
  }
}

export function getDateRangeLabel(value: DateRangeValue): string {
  if (typeof value === "string") return PRESET_LABELS[value]
  return `${format(value.from, "MMM d")} – ${format(value.to, "MMM d, yyyy")}`
}

export function isDateInRange(date: Date, value: DateRangeValue): boolean {
  if (value === "all_time") return true
  const t = date.getTime()
  if (typeof value === "string") {
    const { start, end } = getPresetRange(value)
    return t >= start.getTime() && t <= end.getTime()
  }
  return t >= value.from.getTime() && t <= endOfDay(value.to).getTime()
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  presets?: SidebarKey[]
}

export default function DateRangePicker({
  value,
  onChange,
  presets,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [pendingKey, setPendingKey] = useState<SidebarKey>("this_month")
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(undefined)

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      if (typeof value === "string") {
        setPendingKey(value)
        setPendingRange(undefined)
      } else {
        setPendingKey("custom")
        setPendingRange({ from: value.from, to: value.to })
      }
    }
    setOpen(isOpen)
  }

  function handleApply() {
    if (pendingKey !== "custom") {
      onChange(pendingKey)
      setOpen(false)
    } else if (pendingRange?.from && pendingRange?.to) {
      onChange({ from: pendingRange.from, to: pendingRange.to })
      setOpen(false)
    }
  }

  const visiblePresets = presets
    ? DEFAULT_PRESETS.filter((p) => presets.includes(p.key))
    : DEFAULT_PRESETS

  const applyDisabled =
    pendingKey === "custom" && (!pendingRange?.from || !pendingRange?.to)

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span>{getDateRangeLabel(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-auto p-0">
        <div className="flex">
          {/* Preset sidebar */}
          <div className="flex w-44 shrink-0 flex-col border-r border-border p-1.5">
            {visiblePresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => setPendingKey(preset.key)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  pendingKey === preset.key
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar — only visible in Custom Range mode */}
          {pendingKey === "custom" && (
            <div className="p-2">
              <Calendar
                mode="range"
                selected={pendingRange}
                onSelect={(range) => setPendingRange(range)}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border p-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={applyDisabled} onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
