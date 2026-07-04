"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Plus, Tags, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ServiceType } from "@/types"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import {
  useGetCategoriesQuery,
  useGetItemsQuery,
  useDeletePriceListItemMutation,
  useToggleItemActiveMutation,
  type PriceListItem,
} from "@/redux/api/catalogApi"
import { apiError } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ManageCategoriesDialog from "@/components/price-list/ManageCategoriesDialog"
import ItemDialog from "@/components/price-list/ItemDialog"
import PriceListFilters from "@/components/price-list/PriceListFilters"
import PriceListTable from "@/components/price-list/PriceListTable"

export default function PriceListPage() {
  const {
    data: business,
    isLoading: businessLoading,
    isFetching: businessFetching,
    isError: businessError,
    error: businessErrorData,
  } = useGetMyBusinessQuery()
  // Treat any in-flight fetch — not just the first one — as "loading", so a background
  // refetch on remount doesn't briefly render stale cached data before correcting itself.
  const isBusinessLoading = businessLoading || businessFetching
  const businessId = business?.id

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const [categoryFilter, setCategoryFilter] = useState("all")
  const [serviceTypeFilters, setServiceTypeFilters] = useState<ServiceType[]>([])

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useGetCategoriesQuery(businessId ?? "", { skip: !businessId })
  const categories = useMemo(() => categoriesData ?? [], [categoriesData])
  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  const {
    data: items = [],
    isLoading: itemsLoading,
    isFetching: itemsFetching,
    isError: itemsError,
  } = useGetItemsQuery(
    {
      businessId: businessId ?? "",
      search: debouncedSearch || undefined,
      category_id: categoryFilter !== "all" ? categoryFilter : undefined,
      include_inactive: true,
    },
    { skip: !businessId }
  )

  const filtered = useMemo(() => {
    if (serviceTypeFilters.length === 0) return items
    return items.filter((item) =>
      serviceTypeFilters.some((t) => item.service_types.includes(t))
    )
  }, [items, serviceTypeFilters])

  const [toggleItemActive] = useToggleItemActiveMutation()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleToggleActive(item: PriceListItem) {
    setTogglingId(item.id)
    try {
      await toggleItemActive(item.id).unwrap()
    } catch (error) {
      toast.error(apiError(error, "Couldn't update item"))
    } finally {
      setTogglingId(null)
    }
  }

  const [deletePriceListItem, { isLoading: isDeleting }] = useDeletePriceListItemMutation()

  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PriceListItem | null>(null)

  function toggleServiceTypeFilter(type: ServiceType) {
    setServiceTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  function handleAddItem() {
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  function handleEditItem(item: PriceListItem) {
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deletePriceListItem(deleteTarget.id).unwrap()
      toast.success(`"${deleteTarget.name}" removed from price list`)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(apiError(error, "Couldn't delete item"))
    }
  }

  const isFiltered = !!search || categoryFilter !== "all" || serviceTypeFilters.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Price List
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage the services and prices you offer customers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setManageCategoriesOpen(true)}>
            <Tags className="mr-2 size-4" />
            Manage Categories
          </Button>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 size-4" />
            Add Item
          </Button>
        </div>
      </div>

      {businessError && !isBusinessLoading ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {apiError(businessErrorData, "We couldn't load your business details.")}
            {" "}Complete business registration to manage your price list.
          </p>
        </div>
      ) : (
        <>
          <PriceListFilters
            loading={isBusinessLoading}
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            serviceTypeFilters={serviceTypeFilters}
            onToggleServiceTypeFilter={toggleServiceTypeFilter}
          />

          <PriceListTable
            loading={isBusinessLoading || itemsLoading || itemsFetching || categoriesLoading || categoriesFetching}
            error={itemsError}
            items={filtered}
            isFiltered={isFiltered}
            categoryNameById={categoryNameById}
            togglingId={togglingId}
            onToggleActive={handleToggleActive}
            onEdit={handleEditItem}
            onDelete={setDeleteTarget}
          />
        </>
      )}

      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
        businessId={businessId}
      />

      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        categories={categories}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>{" "}
              from your price list. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
