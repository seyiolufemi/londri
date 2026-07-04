"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ServiceType } from "@/types"
import {
  useCreatePriceListItemMutation,
  useUpdatePriceListItemMutation,
  type Category,
  type PriceListItem,
  type UpdatePriceListItemRequest,
} from "@/redux/api/catalogApi"
import { apiError } from "@/lib/apiError"
import { ALL_SERVICE_TYPES, SERVICE_TYPE_LABELS } from "./constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function ItemDialog({ open, onOpenChange, item, categories }: ItemDialogProps) {
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
                disabled={categories.length === 0}
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
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No categories yet — add one via &quot;Manage Categories&quot; first.
                </p>
              ) : errors.categoryId ? (
                <p className="text-xs text-destructive">{errors.categoryId}</p>
              ) : null}
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
