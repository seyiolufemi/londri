"use client"

import { Search, ChevronDown } from "lucide-react"
import type { ServiceType } from "@/types"
import type { Category } from "@/redux/api/catalogApi"
import { ALL_SERVICE_TYPES, SERVICE_TYPE_LABELS } from "./constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface PriceListFiltersProps {
  loading: boolean
  search: string
  onSearchChange: (value: string) => void
  categories: Category[]
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  serviceTypeFilters: ServiceType[]
  onToggleServiceTypeFilter: (type: ServiceType) => void
}

export default function PriceListFilters({
  loading,
  search,
  onSearchChange,
  categories,
  categoryFilter,
  onCategoryFilterChange,
  serviceTypeFilters,
  onToggleServiceTypeFilter,
}: PriceListFiltersProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 min-w-[200px] max-w-xs flex-1 rounded-md" />
        <Skeleton className="h-9 w-[160px] rounded-md" />
        <Skeleton className="h-9 w-[160px] rounded-md" />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search items..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[160px] justify-between font-normal"
          >
            <span>
              {serviceTypeFilters.length > 0
                ? `Service Type (${serviceTypeFilters.length})`
                : "Service Type"}
            </span>
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[168px] p-1.5" align="start">
          <div className="space-y-0.5">
            {ALL_SERVICE_TYPES.map((type) => (
              <div
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                onClick={() => onToggleServiceTypeFilter(type)}
              >
                <Checkbox
                  id={`filter-svc-${type}`}
                  checked={serviceTypeFilters.includes(type)}
                  onCheckedChange={() => onToggleServiceTypeFilter(type)}
                />
                <label
                  htmlFor={`filter-svc-${type}`}
                  className="cursor-pointer text-sm"
                >
                  {SERVICE_TYPE_LABELS[type]}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
