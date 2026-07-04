"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Plus, Tags, Pencil, Trash2, Search, ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ServiceType } from "@/types"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetItemsQuery,
  useCreatePriceListItemMutation,
  useUpdatePriceListItemMutation,
  useDeletePriceListItemMutation,
  useToggleItemActiveMutation,
  type Category,
  type PriceListItem,
  type UpdatePriceListItemRequest,
} from "@/redux/api/catalogApi"
import { getApiErrorMessage } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const ALL_SERVICE_TYPES: ServiceType[] = ["wash", "dry_clean", "iron"]

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  wash: "Wash",
  dry_clean: "Dry Clean",
  iron: "Iron",
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

function apiError(error: unknown, fallback: string) {
  return getApiErrorMessage((error as { data?: unknown })?.data, fallback)
}

// ─── Manage Categories Dialog ─────────────────────────────────────────────────

interface ManageCategoriesDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  businessId: string | undefined
}

function ManageCategoriesDialog({ open, onOpenChange, businessId }: ManageCategoriesDialogProps) {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery(businessId ?? "", {
    skip: !businessId,
  })
  const categories = categoriesData?.[0]?.categories ?? []

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [newCategoryName, setNewCategoryName] = useState("")

  async function handleAdd() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    try {
      await createCategory({ name: trimmed }).unwrap()
      toast.success(`Category "${trimmed}" added`)
      setNewCategoryName("")
    } catch (error) {
      toast.error(apiError(error, "Couldn't add category"))
    }
  }

  async function handleDelete(category: Category) {
    setDeletingId(category.id)
    try {
      await deleteCategory(category.id).unwrap()
      toast.success(`Category "${category.name}" removed`)
    } catch (error) {
      toast.error(apiError(error, "Couldn't remove category"))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add or remove item categories. Categories still attached to price
            list items can&apos;t be deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))
          ) : categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No categories yet. Add one below.
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm text-foreground">{cat.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  disabled={deletingId === cat.id}
                  onClick={() => handleDelete(cat)}
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
          />
          <Button
            variant="outline"
            onClick={handleAdd}
            disabled={!newCategoryName.trim() || isCreating}
          >
            {isCreating && <Loader2 className="size-4 animate-spin" />}
            Add
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Item Dialog (Add / Edit) ─────────────────────────────────────────────────

interface ItemDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: PriceListItem | null
  categories: Category[]
}

interface ItemForm {
  name: string
  categoryId: string
  serviceTypes: ServiceType[]
  unit: string
  price: string
  turnaroundHours: string
  description: string
}

interface ItemFormErrors {
  name?: string
  categoryId?: string
  serviceTypes?: string
  unit?: string
  price?: string
  turnaroundHours?: string
}

const EMPTY_FORM: ItemForm = {
  name: "",
  categoryId: "",
  serviceTypes: [],
  unit: "",
  price: "",
  turnaroundHours: "",
  description: "",
}

function ItemDialog({ open, onOpenChange, item, categories }: ItemDialogProps) {
  const [createPriceListItem, { isLoading: isCreating }] = useCreatePriceListItemMutation()
  const [updatePriceListItem, { isLoading: isUpdating }] = useUpdatePriceListItemMutation()

  const [form, setForm] = useState<ItemForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<ItemFormErrors>({})

  // Reset the form whenever the dialog transitions from closed to open, rather than
  // in an effect — avoids an extra render pass (see react-hooks/set-state-in-effect).
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      if (item) {
        setForm({
          name: item.name,
          categoryId: item.category_id,
          // API returns service_types as string[]; the checkbox UI only ever writes ALL_SERVICE_TYPES values back
          serviceTypes: item.service_types as ServiceType[],
          unit: item.unit,
          price: String(item.price),
          turnaroundHours: String(item.turnaround_hours),
          description: item.description,
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  }

  function setField<K extends keyof ItemForm>(key: K, value: ItemForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function toggleServiceType(type: ServiceType) {
    setForm((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }))
    setErrors((prev) => ({ ...prev, serviceTypes: undefined }))
  }

  function validate(): boolean {
    const errs: ItemFormErrors = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.categoryId) errs.categoryId = "Category is required"
    if (form.serviceTypes.length === 0)
      errs.serviceTypes = "Select at least one service type"
    if (!form.unit) errs.unit = "Unit is required"
    const price = parseFloat(form.price)
    if (!form.price || isNaN(price) || price <= 0)
      errs.price = "Enter a valid price"
    const hours = parseInt(form.turnaroundHours, 10)
    if (!form.turnaroundHours || isNaN(hours) || hours <= 0)
      errs.turnaroundHours = "Enter a valid number of hours"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    const body: UpdatePriceListItemRequest = {
      name: form.name.trim(),
      category_id: form.categoryId,
      service_types: form.serviceTypes,
      unit: form.unit,
      price: parseFloat(form.price),
      turnaround_hours: parseInt(form.turnaroundHours, 10),
      description: form.description.trim(),
    }

    if (item) {
      try {
        await updatePriceListItem({ itemId: item.id, body }).unwrap()
        toast.success("Item updated")
        onOpenChange(false)
      } catch (error) {
        toast.error(apiError(error, "Couldn't update item"))
      }
    } else {
      try {
        await createPriceListItem(body).unwrap()
        toast.success("Item added to price list")
        onOpenChange(false)
      } catch (error) {
        toast.error(apiError(error, "Couldn't add item"))
      }
    }
  }

  const isEdit = !!item

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Item" : "Add Item"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this price list item."
              : "Add a new item to your price list."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              placeholder="e.g. Plain Shirt"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setField("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={form.unit}
                onValueChange={(v) => setField("unit", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per item">Per Item</SelectItem>
                  <SelectItem value="per kg">Per Kg</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-xs text-destructive">{errors.unit}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Service Type</Label>
            <div className="flex gap-6">
              {ALL_SERVICE_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`svc-${type}`}
                    checked={form.serviceTypes.includes(type)}
                    onCheckedChange={() => toggleServiceType(type)}
                  />
                  <label
                    htmlFor={`svc-${type}`}
                    className="cursor-pointer text-sm text-foreground"
                  >
                    {SERVICE_TYPE_LABELS[type]}
                  </label>
                </div>
              ))}
            </div>
            {errors.serviceTypes && (
              <p className="text-xs text-destructive">{errors.serviceTypes}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="item-price">Price (₦)</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 800"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="item-turnaround">Turnaround (hours)</Label>
              <Input
                id="item-turnaround"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 24"
                value={form.turnaroundHours}
                onChange={(e) => setField("turnaroundHours", e.target.value)}
              />
              {errors.turnaroundHours && (
                <p className="text-xs text-destructive">{errors.turnaroundHours}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-description">Description (optional)</Label>
            <Textarea
              id="item-description"
              placeholder="Any extra detail customers should know"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isEdit ? isUpdating : isCreating}>
            {(isEdit ? isUpdating : isCreating) && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Items table skeleton ───────────────────────────────────────────────────

function ItemsTableSkeleton() {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PriceListPage() {
  const { data: business, isLoading: businessLoading, isError: businessError, error: businessErrorData } = useGetMyBusinessQuery()
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

  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery(
    businessId ?? "",
    { skip: !businessId }
  )
  const categories = useMemo(() => categoriesData?.[0]?.categories ?? [], [categoriesData])
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

  const isLoadingItems = itemsLoading || itemsFetching

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Button
            variant="outline"
            onClick={() => setManageCategoriesOpen(true)}
          >
            <Tags className="mr-2 size-4" />
            Manage Categories
          </Button>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 size-4" />
            Add Item
          </Button>
        </div>
      </div>

      {businessError && !businessLoading ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {apiError(businessErrorData, "We couldn't load your business details.")}
            {" "}Complete business registration to manage your price list.
          </p>
        </div>
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            {businessLoading ? (
              <>
                <Skeleton className="h-9 min-w-[200px] max-w-xs flex-1 rounded-md" />
                <Skeleton className="h-9 w-[160px] rounded-md" />
                <Skeleton className="h-9 w-[160px] rounded-md" />
              </>
            ) : (
              <>
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                          onClick={() => toggleServiceTypeFilter(type)}
                        >
                          <Checkbox
                            id={`filter-svc-${type}`}
                            checked={serviceTypeFilters.includes(type)}
                            onCheckedChange={() => toggleServiceTypeFilter(type)}
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
              </>
            )}
          </div>

          {/* Table */}
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
                {businessLoading || isLoadingItems || categoriesLoading ? (
                  <ItemsTableSkeleton />
                ) : itemsError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      Couldn&apos;t load your price list. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      {search ||
                      categoryFilter !== "all" ||
                      serviceTypeFilters.length > 0
                        ? "No items match your filters."
                        : 'No items in your price list yet. Click "Add Item" to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "transition-opacity",
                        !item.is_active && "opacity-50"
                      )}
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
                              {SERVICE_TYPE_LABELS[type as ServiceType] ?? type}
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
                            onCheckedChange={() => handleToggleActive(item)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleEditItem(item)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(item)}
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
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
