"use client"

import { Pencil, Trash2, Loader2 } from "lucide-react"
import type { PriceListItem } from "@/redux/api/catalogApi"
import { formatNaira } from "./constants"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="pl-5"><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
          <TableCell><Skeleton className="h-4 w-14" /></TableCell>
          <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-9 rounded-full" /></TableCell>
          <TableCell className="pr-5"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

interface PriceListTableProps {
  loading: boolean
  error: boolean
  items: PriceListItem[]
  isFiltered: boolean
  categoryNameById: Record<string, string>
  togglingId: string | null
  onToggleActive: (item: PriceListItem) => void
  onEdit: (item: PriceListItem) => void
  onDelete: (item: PriceListItem) => void
}

export default function PriceListTable({
  loading,
  error,
  items,
  isFiltered,
  categoryNameById,
  togglingId,
  onToggleActive,
  onEdit,
  onDelete,
}: PriceListTableProps) {
  return (
    <div className="rounded-xl border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Category
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Service Type
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Unit
            </TableHead>
            <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Price
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Turnaround
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Active
            </TableHead>
            <TableHead className="pr-5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                Couldn&apos;t load your price list. Please try again.
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                {isFiltered
                  ? "No items match your filters."
                  : 'No items in your price list yet. Click "Add Item" to get started.'}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                className={cn("transition-opacity", !item.is_active && "opacity-50")}
              >
                <TableCell className="pl-5 text-sm font-medium text-foreground">
                  {item.name}
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                    {categoryNameById[item.category_id] ?? item.category_id}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.service_types.map((type) => (
                      <span
                        key={type}
                        className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm capitalize text-muted-foreground">
                  {item.unit}
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                  {formatNaira(item.price)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.turnaround_hours}h
                </TableCell>
                <TableCell>
                  {togglingId === item.id ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={() => onToggleActive(item)}
                    />
                  )}
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
