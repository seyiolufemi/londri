"use client"

import { useState } from "react"
import { Check, SlidersHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useKybStatus } from "@/lib/hooks/useKybStatus"
import type { KybStatus } from "@/types"

const STATUS_LABELS: Record<KybStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
}

const ALL_STATUSES: KybStatus[] = ["pending", "under_review", "approved", "rejected"]

export default function DemoToggle() {
  const { kybStatus, setKybStatus } = useKybStatus()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground shadow-md">
            <SlidersHorizontal className="size-3" />
            KYB: {STATUS_LABELS[kybStatus]}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-48 p-1.5">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                setKybStatus(status)
                setOpen(false)
              }}
            >
              {STATUS_LABELS[status]}
              {kybStatus === status && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
