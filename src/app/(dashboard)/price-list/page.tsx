"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, Tags, Pencil, Trash2, Search, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { useKybStatus } from "@/lib/hooks/useKybStatus"
import type { PriceListItem, ServiceType, PriceCategory } from "@/types"
import TablePagination, { paginate } from "@/components/shared/TablePagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const ALL_SERVICE_TYPES: ServiceType[] = ["wash", "dry_clean", "iron"]
const PAGE_SIZE = 10

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  wash: "Wash",
  dry_clean: "Dry Clean",
  iron: "Iron",
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

// ─── Manage Categories Dialog ─────────────────────────────────────────────────

interface ManageCategoriesDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const itemCategories = useStore((s) => s.itemCategories)
  const priceListItems = useStore((s) => s.priceListItems)
  const subscriptionPlans = useStore((s) => s.subscriptionPlans)
  const addItemCategory = useStore((s) => s.addItemCategory)
  const deleteItemCategory = useStore((s) => s.deleteItemCategory)

  const [newCategoryName, setNewCategoryName] = useState("")

  function isCategoryInUse(category: string): boolean {
    const lower = category.toLowerCase()
    return (
      priceListItems.some((item) => item.category === lower) ||
      subscriptionPlans.some((plan) =>
        plan.categories.includes(lower as PriceCategory)
      )
    )
  }

  function handleAdd() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    addItemCategory(trimmed)
    setNewCategoryName("")
  }

  function handleDelete(category: string) {
    deleteItemCategory(category)
    toast.success(`Category "${category}" removed`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add or remove item categories. Categories in use by items or plans
            cannot be deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {itemCategories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No categories yet. Add one below.
            </p>
          ) : (
            itemCategories.map((cat) => {
              const inUse = isCategoryInUse(cat)
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-sm text-foreground">{cat}</span>
                  <TooltipProvider>
                    {inUse ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive"
                              disabled
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>In use by items or plans</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cat)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </TooltipProvider>
                </div>
              )
            })
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
            disabled={!newCategoryName.trim()}
          >
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
}

interface ItemForm {
  name: string
  category: string
  serviceTypes: ServiceType[]
  unit: string
  price: string
  turnaround: string
}

interface ItemFormErrors {
  name?: string
  category?: string
  serviceTypes?: string
  unit?: string
  price?: string
  turnaround?: string
}

const EMPTY_FORM: ItemForm = {
  name: "",
  category: "",
  serviceTypes: [],
  unit: "",
  price: "",
  turnaround: "",
}

function ItemDialog({ open, onOpenChange, item }: ItemDialogProps) {
  const itemCategories = useStore((s) => s.itemCategories)
  const addPriceListItem = useStore((s) => s.addPriceListItem)
  const updatePriceListItem = useStore((s) => s.updatePriceListItem)

  const [form, setForm] = useState<ItemForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<ItemFormErrors>({})

  useEffect(() => {
    if (!open) return
    if (item) {
      setForm({
        name: item.name,
        category:
          item.category.charAt(0).toUpperCase() + item.category.slice(1),
        serviceTypes: item.serviceTypes,
        unit: item.unit,
        price: String(item.price),
        turnaround: item.turnaround,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [open, item])

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
    if (!form.category) errs.category = "Category is required"
    if (form.serviceTypes.length === 0)
      errs.serviceTypes = "Select at least one service type"
    if (!form.unit) errs.unit = "Unit is required"
    const price = parseFloat(form.price)
    if (!form.price || isNaN(price) || price <= 0)
      errs.price = "Enter a valid price"
    if (!form.turnaround.trim()) errs.turnaround = "Turnaround is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    const category = form.category.toLowerCase() as PriceCategory
    const price = parseFloat(form.price)

    if (item) {
      updatePriceListItem(item.id, {
        name: form.name.trim(),
        category,
        serviceTypes: form.serviceTypes,
        unit: form.unit,
        price,
        turnaround: form.turnaround.trim(),
      })
      toast.success("Item updated")
    } else {
      addPriceListItem({
        id: `item_${Date.now()}`,
        name: form.name.trim(),
        category,
        serviceTypes: form.serviceTypes,
        price,
        unit: form.unit,
        turnaround: form.turnaround.trim(),
        description: "",
        isActive: true,
      })
      toast.success("Item added to price list")
    }
    onOpenChange(false)
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
                value={form.category}
                onValueChange={(v) => setField("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
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
              <Label htmlFor="item-turnaround">Turnaround</Label>
              <Input
                id="item-turnaround"
                placeholder="e.g. 24 hours"
                value={form.turnaround}
                onChange={(e) => setField("turnaround", e.target.value)}
              />
              {errors.turnaround && (
                <p className="text-xs text-destructive">{errors.turnaround}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PriceListPage() {
  const { kybStatus } = useKybStatus()
  const priceListItems = useStore((s) => s.priceListItems)
  const itemCategories = useStore((s) => s.itemCategories)
  const togglePriceListItemActive = useStore((s) => s.togglePriceListItemActive)
  const deletePriceListItem = useStore((s) => s.deletePriceListItem)

  const isApproved = kybStatus === "approved"

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [serviceTypeFilters, setServiceTypeFilters] = useState<ServiceType[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PriceListItem | null>(null)

  function handleSearch(v: string) { setSearch(v); setCurrentPage(1) }
  function handleCategoryFilter(v: string) { setCategoryFilter(v); setCurrentPage(1) }

  function toggleServiceTypeFilter(type: ServiceType) {
    setServiceTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setCurrentPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return priceListItems.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false
      if (categoryFilter !== "all" && item.category !== categoryFilter)
        return false
      if (
        serviceTypeFilters.length > 0 &&
        !serviceTypeFilters.some((t) => item.serviceTypes.includes(t))
      )
        return false
      return true
    })
  }, [priceListItems, search, categoryFilter, serviceTypeFilters])

  const pagedItems = paginate(filtered, currentPage, PAGE_SIZE)

  function handleAddItem() {
    if (!isApproved) {
      toast.warning("Verification required", {
        description: "Complete KYB verification to manage your price list.",
      })
      return
    }
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  function handleEditItem(item: PriceListItem) {
    if (!isApproved) {
      toast.warning("Verification required", {
        description: "Complete KYB verification to manage your price list.",
      })
      return
    }
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  function handleToggleActive(item: PriceListItem) {
    if (!isApproved) {
      toast.warning("Verification required", {
        description: "Complete KYB verification to manage your price list.",
      })
      return
    }
    togglePriceListItemActive(item.id)
  }

  function handleDeleteRequest(item: PriceListItem) {
    if (!isApproved) {
      toast.warning("Verification required", {
        description: "Complete KYB verification to manage your price list.",
      })
      return
    }
    setDeleteTarget(item)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deletePriceListItem(deleteTarget.id)
    toast.success(`"${deleteTarget.name}" removed from price list`)
    setDeleteTarget(null)
  }

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

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search items..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {itemCategories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>
                {cat}
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
            {filtered.length === 0 ? (
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
              pagedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "transition-opacity",
                    !item.isActive && "opacity-50"
                  )}
                >
                  <TableCell className="pl-5 text-sm font-medium text-foreground">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.serviceTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400"
                        >
                          {SERVICE_TYPE_LABELS[type]}
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
                    {item.turnaround}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleActive(item)}
                    />
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
                        onClick={() => handleDeleteRequest(item)}
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
        {filtered.length > 0 && (
          <div className="px-5 pb-4">
            <TablePagination currentPage={currentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
      />

      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
