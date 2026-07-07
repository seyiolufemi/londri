"use client"

import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronDown, Loader2, Search, SearchX, X } from "lucide-react"
import Navbar from "@/components/customer/Navbar"
import BusinessCard from "@/components/customer/BusinessCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetDiscoverableBusinessesQuery } from "@/redux/api/businessApi"
import { ALL_SERVICE_TYPES, SERVICE_TYPE_LABELS, getDistanceKm, pickCheapestPrice, pickServiceTypes } from "@/components/customer/businessDisplay"
import { useGeolocation } from "@/lib/hooks/useGeolocation"
import { Skeleton } from "@/components/ui/skeleton"
import type { ServiceType } from "@/types"

type SortOption = "nearest" | "price_asc" | "price_desc"

const SORT_LABELS: Record<SortOption, string> = {
  nearest: "Nearest first",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
}

const PAGE_SIZE = 9

function BusinessCardSkeleton() {
  return (
    <div className="p-4 text-center">
      <Skeleton className="mx-auto h-48 w-full rounded-lg sm:h-52 md:h-56" />
      <div className="mt-6 flex flex-col items-center gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverPageContent />
    </Suspense>
  )
}

function DiscoverPageContent() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "")
  const [serviceTypeFilters, setServiceTypeFilters] = useState<ServiceType[]>([])
  const [sort, setSort] = useState<SortOption>("nearest")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Backend already only returns discoverable, verified businesses here.
  const { data: businesses, isLoading } = useGetDiscoverableBusinessesQuery()
  const discoverable = useMemo(
    () => businesses ?? [],
    [businesses]
  )

  const { coords: customerCoords } = useGeolocation()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result = discoverable.filter((b) => {
      const matchesSearch =
        !q || b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
      const matchesServiceType =
        serviceTypeFilters.length === 0 ||
        serviceTypeFilters.some((t) => pickServiceTypes(b.id).includes(t))
      return matchesSearch && matchesServiceType
    })

    return [...result].sort((a, b) => {
      if (sort === "price_asc") return pickCheapestPrice(a.id) - pickCheapestPrice(b.id)
      if (sort === "price_desc") return pickCheapestPrice(b.id) - pickCheapestPrice(a.id)
      return getDistanceKm(a, customerCoords) - getDistanceKm(b, customerCoords)
    })
  }, [discoverable, search, serviceTypeFilters, sort, customerCoords])

  // Filters/search/sort reset the loaded batch back to the first page. Adjusted
  // during render (React's recommended pattern for derived resets) rather than
  // in an effect, which would cause an extra render pass after every change.
  const filterKey = `${search}|${sort}|${serviceTypeFilters.join(",")}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setVisibleCount(PAGE_SIZE)
  }

  const visibleBusinesses = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const loadMore = useCallback(() => {
    setLoadingMore((prevLoading) => {
      if (prevLoading) return prevLoading
      setTimeout(() => {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))
        setLoadingMore(false)
      }, 400)
      return true
    })
  }, [filtered.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  function toggleServiceType(type: ServiceType) {
    setServiceTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const activeFilters: { key: string; label: string; onRemove: () => void }[] = []
  serviceTypeFilters.forEach((type) => {
    activeFilters.push({
      key: `svc-${type}`,
      label: SERVICE_TYPE_LABELS[type],
      onRemove: () => toggleServiceType(type),
    })
  })
  if (sort !== "nearest") {
    activeFilters.push({
      key: "sort",
      label: SORT_LABELS[sort],
      onRemove: () => setSort("nearest"),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-[1092px] px-6 py-10">
        <h1 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-foreground md:text-3xl">
          All laundries near you
        </h1>

        {/* Search */}
        <div className="mt-6 flex h-[50px] w-full max-w-[517px] items-center rounded-full border border-input bg-muted/30 p-[5px] sm:h-[55px]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location or laundry name"
            className="h-full flex-1 border-none bg-transparent pl-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="button"
            aria-label="Search"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary p-0 text-white hover:bg-primary/90 sm:size-[45px]"
          >
            <Search className="size-4 sm:size-[18px]" />
          </Button>
        </div>

        {/* Filter bar */}
        <div className="mt-4 mb-6 flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between font-normal">
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
                  <label
                    key={type}
                    htmlFor={`filter-svc-${type}`}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                  >
                    <Checkbox
                      id={`filter-svc-${type}`}
                      checked={serviceTypeFilters.includes(type)}
                      onCheckedChange={() => toggleServiceType(type)}
                    />
                    <span className="text-sm">{SERVICE_TYPE_LABELS[type]}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nearest">Nearest first</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
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

        {/* Results count/context line */}
        <p className="mb-4 text-sm text-muted-foreground">
          {search.trim()
            ? `Showing ${filtered.length} results for "${search.trim()}"`
            : serviceTypeFilters.length > 0
              ? `Showing ${filtered.length} results`
              : `Showing ${filtered.length} laundries near you`}
        </p>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <BusinessCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No laundries found</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleBusinesses.map((business, index) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  index={index % PAGE_SIZE}
                  customerCoords={customerCoords}
                />
              ))}
            </div>

            {hasMore ? (
              <div ref={sentinelRef} className="flex h-16 items-center justify-center">
                {loadingMore && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                You&apos;ve reached the end
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
