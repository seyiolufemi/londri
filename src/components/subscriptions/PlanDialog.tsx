"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  useCreatePlanMutation,
  useUpdatePlanMutation,
  type BillingCycle,
  type Category,
  type CreatePlanRequest,
  type SubscriptionPlan,
} from "@/redux/api/catalogApi"
import { apiError } from "@/lib/apiError"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface PlanFormState {
  name: string
  price: string
  billingCycle: BillingCycle
  itemCap: string
  categoryIds: string[]
  description: string
}

interface PlanFormErrors {
  name?: string
  price?: string
  itemCap?: string
  categoryIds?: string
}

const EMPTY_FORM: PlanFormState = {
  name: "",
  price: "",
  billingCycle: "monthly",
  itemCap: "",
  categoryIds: [],
  description: "",
}

interface PlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPlan: SubscriptionPlan | null
  categories: Category[]
}

export default function PlanDialog({ open, onOpenChange, editingPlan, categories }: PlanDialogProps) {
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation()
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation()

  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<PlanFormErrors>({})

  // Reset the form whenever the dialog transitions from closed to open, rather than
  // in an effect — avoids an extra render pass (see react-hooks/set-state-in-effect).
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      if (editingPlan) {
        setForm({
          name: editingPlan.name,
          price: String(editingPlan.price),
          billingCycle: editingPlan.billing_cycle === "weekly" ? "weekly" : "monthly",
          itemCap: String(editingPlan.item_cap),
          categoryIds: editingPlan.eligible_category_ids,
          description: editingPlan.description,
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  }

  function toggleCategory(id: string) {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }))
    setErrors((e) => ({ ...e, categoryIds: undefined }))
  }

  function validate(): boolean {
    const errs: PlanFormErrors = {}
    if (!form.name.trim()) errs.name = "Plan name is required"
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = "Valid price is required"
    if (!form.itemCap.trim() || isNaN(Number(form.itemCap)) || Number(form.itemCap) <= 0)
      errs.itemCap = "Item cap is required"
    if (form.categoryIds.length === 0)
      errs.categoryIds = "Select at least one category"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    const body: CreatePlanRequest = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      billing_cycle: form.billingCycle,
      item_cap: Number(form.itemCap),
      eligible_category_ids: form.categoryIds,
      cancel_policy: "at_period_end",
    }

    if (editingPlan) {
      try {
        await updatePlan({ planId: editingPlan.id, body }).unwrap()
        toast.success("Plan updated", { description: form.name.trim() })
        onOpenChange(false)
      } catch (error) {
        toast.error(apiError(error, "Couldn't update plan"))
      }
    } else {
      try {
        await createPlan(body).unwrap()
        toast.success("Plan created", { description: form.name.trim() })
        onOpenChange(false)
      } catch (error) {
        toast.error(apiError(error, "Couldn't create plan"))
      }
    }
  }

  const isEditing = editingPlan !== null
  const isSaving = isEditing ? isUpdating : isCreating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Subscription Plan" : "Add Subscription Plan"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div>
            <Label htmlFor="plan-name" className="mb-1.5 block text-sm">
              Plan name
            </Label>
            <Input
              id="plan-name"
              placeholder="Standard Plan"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }))
                setErrors((er) => ({ ...er, name: undefined }))
              }}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="plan-price" className="mb-1.5 block text-sm">
                Price (₦)
              </Label>
              <Input
                id="plan-price"
                type="number"
                placeholder="22000"
                value={form.price}
                onChange={(e) => {
                  setForm((f) => ({ ...f, price: e.target.value }))
                  setErrors((er) => ({ ...er, price: undefined }))
                }}
                className={cn(errors.price && "border-destructive")}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-destructive">{errors.price}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Billing cycle</Label>
              <Select
                value={form.billingCycle}
                onValueChange={(v) => setForm((f) => ({ ...f, billingCycle: v as BillingCycle }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="plan-item-cap" className="mb-1.5 block text-sm">
              Item cap
            </Label>
            <Input
              id="plan-item-cap"
              type="number"
              placeholder="50"
              value={form.itemCap}
              onChange={(e) => {
                setForm((f) => ({ ...f, itemCap: e.target.value }))
                setErrors((er) => ({ ...er, itemCap: undefined }))
              }}
              className={cn(errors.itemCap && "border-destructive")}
            />
            {errors.itemCap && (
              <p className="mt-1 text-xs text-destructive">{errors.itemCap}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">Eligible categories</Label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={form.categoryIds.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                  />
                  <span className="text-sm text-foreground">{cat.name}</span>
                </label>
              ))}
            </div>
            {errors.categoryIds && (
              <p className="mt-1 text-xs text-destructive">{errors.categoryIds}</p>
            )}
          </div>

          <div>
            <Label htmlFor="plan-desc" className="mb-1.5 block text-sm">
              Description
            </Label>
            <Textarea
              id="plan-desc"
              placeholder="Perfect for regular households with moderate laundry needs"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
