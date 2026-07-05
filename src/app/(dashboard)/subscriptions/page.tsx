"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Users,
  TrendingUp,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { useKybStatus } from "@/lib/hooks/useKybStatus"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  SubscriptionPlan,
  CustomerSubscription,
  SubscriptionStatus,
  PriceCategory,
} from "@/types"
import TablePagination, { paginate } from "@/components/shared/TablePagination"
import DateRangePicker, { isDateInRange, type DateRangeValue } from "@/components/shared/DateRangePicker"
import StartSubscriptionDialog from "@/components/shared/StartSubscriptionDialog"

const PAGE_SIZE = 10

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<PriceCategory, string> = {
  clothing: "Clothing",
  bedding: "Bedding",
  household: "Household",
  specialty: "Specialty",
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive",
  },
}

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingCycleOption = "weekly" | "monthly"

interface PlanFormState {
  name: string
  price: string
  billingCycle: BillingCycleOption
  credits: string
  categories: PriceCategory[]
  description: string
}

interface PlanFormErrors {
  name?: string
  price?: string
  credits?: string
  categories?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

const EMPTY_FORM: PlanFormState = {
  name: "",
  price: "",
  billingCycle: "monthly",
  credits: "",
  categories: [],
  description: "",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  )
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  return (
    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function SubStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

// ─── Plan Dialog ──────────────────────────────────────────────────────────────

interface PlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPlan: SubscriptionPlan | null
  itemCategories: string[]
  onSave: (form: PlanFormState) => void
}

function PlanDialog({
  open,
  onOpenChange,
  editingPlan,
  itemCategories,
  onSave,
}: PlanDialogProps) {
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<PlanFormErrors>({})

  // Initialise form when editing plan changes or dialog opens
  useMemo(() => {
    if (open) {
      if (editingPlan) {
        setForm({
          name: editingPlan.name,
          price: String(editingPlan.price),
          billingCycle:
            editingPlan.billingCycle === "weekly" ? "weekly" : "monthly",
          credits: String(editingPlan.credits),
          categories: editingPlan.categories,
          description: editingPlan.description,
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingPlan?.id])

  function toggleCategory(cat: PriceCategory) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }))
    if (errors.categories) setErrors((e) => ({ ...e, categories: undefined }))
  }

  function handleSave() {
    const newErrors: PlanFormErrors = {}
    if (!form.name.trim()) newErrors.name = "Plan name is required"
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = "Valid price is required"
    if (!form.credits.trim() || isNaN(Number(form.credits)) || Number(form.credits) <= 0)
      newErrors.credits = "Item cap is required"
    if (form.categories.length === 0)
      newErrors.categories = "Select at least one category"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSave(form)
  }

  const isEditing = editingPlan !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Subscription Plan" : "Add Subscription Plan"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Plan name */}
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
                if (errors.name) setErrors((er) => ({ ...er, name: undefined }))
              }}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Price + Billing cycle side by side */}
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
                  if (errors.price)
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
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    billingCycle: v as BillingCycleOption,
                  }))
                }
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

          {/* Item cap */}
          <div>
            <Label htmlFor="plan-credits" className="mb-1.5 block text-sm">
              Item cap
            </Label>
            <Input
              id="plan-credits"
              type="number"
              placeholder="50"
              value={form.credits}
              onChange={(e) => {
                setForm((f) => ({ ...f, credits: e.target.value }))
                if (errors.credits)
                  setErrors((er) => ({ ...er, credits: undefined }))
              }}
              className={cn(errors.credits && "border-destructive")}
            />
            {errors.credits && (
              <p className="mt-1 text-xs text-destructive">{errors.credits}</p>
            )}
          </div>

          {/* Eligible categories */}
          <div>
            <Label className="mb-2 block text-sm">Eligible categories</Label>
            <div className="flex flex-wrap gap-3">
              {itemCategories.map((catLabel) => {
                const cat = catLabel.toLowerCase() as PriceCategory
                return (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={form.categories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <span className="text-sm text-foreground">
                      {catLabel}
                    </span>
                  </label>
                )
              })}
            </div>
            {errors.categories && (
              <p className="mt-1 text-xs text-destructive">{errors.categories}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="plan-desc" className="mb-1.5 block text-sm">
              Description
            </Label>
            <Textarea
              id="plan-desc"
              placeholder="Perfect for regular households with moderate laundry needs"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Save Changes" : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Subscriber Detail Sheet ──────────────────────────────────────────────────

interface SubscriberSheetProps {
  subscriber: CustomerSubscription | null
  plan: SubscriptionPlan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SubscriberSheet({
  subscriber,
  plan,
  open,
  onOpenChange,
}: SubscriberSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        {subscriber && plan && (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-foreground">
                {subscriber.customerName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {subscriber.customerPhone}
              </p>
            </div>

            {/* Plan info */}
            <section className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-foreground">
                Subscription
              </h3>
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Plan</span>
                    <span className="text-sm text-foreground">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <StatusBadge status={subscriber.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Items used
                    </span>
                    <span className="text-sm tabular-nums text-foreground">
                      {subscriber.creditsUsed} / {subscriber.creditsTotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Start date
                    </span>
                    <span className="text-sm text-foreground">
                      {new Date(subscriber.startDate).toLocaleDateString(
                        "en-NG",
                        { month: "long", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Renewal date
                    </span>
                    <span className="text-sm text-foreground">
                      {new Date(subscriber.nextBillingDate).toLocaleDateString(
                        "en-NG",
                        { month: "long", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Usage progress */}
            <section className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-foreground">
                This Cycle
              </h3>
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-muted-foreground">Items used</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {subscriber.creditsUsed} / {subscriber.creditsTotal}
                  </span>
                </div>
                <UsageBar
                  used={subscriber.creditsUsed}
                  total={subscriber.creditsTotal}
                />
              </div>
            </section>

            {/* Billing history placeholder */}
            <section>
              <h3 className="mb-3 text-sm font-medium text-foreground">
                Billing History
              </h3>
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Billing history will appear here
                </p>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { kybStatus } = useKybStatus()

  const subscriptionPlans = useStore((s) => s.subscriptionPlans)
  const customerSubscriptions = useStore((s) => s.customerSubscriptions)
  const itemCategories = useStore((s) => s.itemCategories)
  const addSubscriptionPlan = useStore((s) => s.addSubscriptionPlan)
  const updateSubscriptionPlan = useStore((s) => s.updateSubscriptionPlan)
  const deleteSubscriptionPlan = useStore((s) => s.deleteSubscriptionPlan)
  const togglePlanActive = useStore((s) => s.togglePlanActive)

  const locked = kybStatus !== "approved"

  // ── Derived ──
  const activeSubsByPlan = useMemo(() => {
    const counts: Record<string, number> = {}
    customerSubscriptions.forEach((s) => {
      if (s.status === "active") {
        counts[s.planId] = (counts[s.planId] ?? 0) + 1
      }
    })
    return counts
  }, [customerSubscriptions])

  const planMap = useMemo(() => {
    const map: Record<string, SubscriptionPlan> = {}
    subscriptionPlans.forEach((p) => {
      map[p.id] = p
    })
    return map
  }, [subscriptionPlans])

  const activeSubscriberCount = useMemo(
    () => customerSubscriptions.filter((s) => s.status === "active").length,
    [customerSubscriptions]
  )

  const monthlyRecurringRevenue = useMemo(() => {
    return customerSubscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const plan = planMap[s.planId]
        if (!plan) return sum
        if (plan.billingCycle === "monthly") return sum + plan.price
        if (plan.billingCycle === "weekly") return sum + plan.price * 4
        if (plan.billingCycle === "quarterly") return sum + Math.round(plan.price / 3)
        if (plan.billingCycle === "annually") return sum + Math.round(plan.price / 12)
        return sum + plan.price
      }, 0)
  }, [customerSubscriptions, planMap])

  const cancelledCount = useMemo(
    () => customerSubscriptions.filter((s) => s.status === "cancelled").length,
    [customerSubscriptions]
  )

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<"subscribers" | "plans">("subscribers")

  // ── Filters ──
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all")

  // ── Pagination ──
  const [subscriberPage, setSubscriberPage] = useState(1)
  const [planPage, setPlanPage] = useState(1)

  const [subscriberDateRange, setSubscriberDateRange] = useState<DateRangeValue>("all_time")

  const filteredSubscribers = useMemo(() => {
    return customerSubscriptions.filter((s) => {
      if (planFilter !== "all" && s.planId !== planFilter) return false
      if (statusFilter !== "all" && s.status !== statusFilter) return false
      if (!isDateInRange(new Date(s.startDate), subscriberDateRange)) return false
      return true
    })
  }, [customerSubscriptions, planFilter, statusFilter, subscriberDateRange])

  function handlePlanFilter(v: string) { setPlanFilter(v); setSubscriberPage(1) }
  function handleSubStatusFilter(v: string) { setStatusFilter(v as SubscriptionStatus | "all"); setSubscriberPage(1) }
  function handleSubscriberDateRange(v: DateRangeValue) { setSubscriberDateRange(v); setSubscriberPage(1) }

  const pagedSubscribers = paginate(filteredSubscribers, subscriberPage, PAGE_SIZE)
  const pagedPlans = paginate(subscriptionPlans, planPage, PAGE_SIZE)

  // ── Dialog state ──
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [newSubDialogOpen, setNewSubDialogOpen] = useState(false)

  function openAddDialog() {
    if (locked) {
      toast.warning("Complete verification to manage plans.")
      return
    }
    setEditingPlan(null)
    setDialogOpen(true)
  }

  function openEditDialog(plan: SubscriptionPlan) {
    setEditingPlan(plan)
    setDialogOpen(true)
  }

  function handleSavePlan(form: PlanFormState) {
    if (editingPlan) {
      updateSubscriptionPlan(editingPlan.id, {
        name: form.name.trim(),
        price: Number(form.price),
        billingCycle: form.billingCycle,
        credits: Number(form.credits),
        categories: form.categories,
        description: form.description,
      })
      toast.success("Plan updated", { description: form.name.trim() })
    } else {
      const newPlan: SubscriptionPlan = {
        id: `plan_${Date.now()}`,
        name: form.name.trim(),
        price: Number(form.price),
        billingCycle: form.billingCycle,
        credits: Number(form.credits),
        categories: form.categories,
        description: form.description,
        features: [],
        isPopular: false,
        isActive: true,
      }
      addSubscriptionPlan(newPlan)
      toast.success("Plan created", { description: form.name.trim() })
    }
    setDialogOpen(false)
    setEditingPlan(null)
  }

  // ── Delete state ──
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null)
  const planToDelete = deletePlanId
    ? (subscriptionPlans.find((p) => p.id === deletePlanId) ?? null)
    : null

  function handleDeleteConfirm() {
    if (!deletePlanId) return
    deleteSubscriptionPlan(deletePlanId)
    toast.success("Plan deleted")
    setDeletePlanId(null)
  }

  // ── Subscriber sheet state ──
  const [viewSubscriberId, setViewSubscriberId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const viewingSubscriber = viewSubscriberId
    ? (customerSubscriptions.find((s) => s.id === viewSubscriberId) ?? null)
    : null
  const viewingPlan = viewingSubscriber
    ? (planMap[viewingSubscriber.planId] ?? null)
    : null

  function openSubscriberSheet(id: string) {
    setViewSubscriberId(id)
    setSheetOpen(true)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Subscriptions
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage subscription plans and view active subscribers
          </p>
        </div>
        {activeTab === "subscribers" && (
          <Button
            disabled={locked}
            className={cn(locked && "cursor-not-allowed opacity-50")}
            onClick={() => {
              if (locked) {
                toast.warning("Complete verification to add subscriptions.")
                return
              }
              setNewSubDialogOpen(true)
            }}
          >
            <UserPlus className="mr-1.5 size-4" />
            New Subscription
          </Button>
        )}
        {activeTab === "plans" && (
          <Button
            disabled={locked}
            className={cn(locked && "cursor-not-allowed opacity-50")}
            onClick={openAddDialog}
          >
            <Plus className="mr-1.5 size-4" />
            Add Plan
          </Button>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as "subscribers" | "plans")
          setSubscriberPage(1)
          setPlanPage(1)
        }}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Subscribers ── */}
        <TabsContent value="subscribers" className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            <SubStatCard
              label="Active Subscribers"
              value={activeSubscriberCount}
              icon={Users}
            />
            <SubStatCard
              label="Monthly Recurring Revenue"
              value={formatNaira(monthlyRecurringRevenue)}
              icon={TrendingUp}
            />
            <SubStatCard
              label="Cancelled"
              value={cancelledCount}
              icon={UserMinus}
            />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-3">
            <Select value={planFilter} onValueChange={handlePlanFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {subscriptionPlans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={handleSubStatusFilter}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker value={subscriberDateRange} onChange={handleSubscriberDateRange} />
          </div>

          {/* Subscribers table */}
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {filteredSubscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="size-7 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No subscribers found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Customer
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Plan
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Usage This Cycle
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Next Billing
                    </TableHead>
                    <TableHead className="pl-4 pr-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedSubscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="pl-5 pr-4">
                        <p className="text-sm font-medium text-foreground">
                          {sub.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.customerPhone}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 text-sm text-foreground">
                        {sub.planName}
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell className="px-4">
                        <p className="text-sm tabular-nums text-foreground">
                          {sub.creditsUsed}/{sub.creditsTotal} items
                        </p>
                        <UsageBar
                          used={sub.creditsUsed}
                          total={sub.creditsTotal}
                        />
                      </TableCell>
                      <TableCell className="px-4 text-sm text-muted-foreground">
                        {new Date(sub.nextBillingDate).toLocaleDateString(
                          "en-NG",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </TableCell>
                      <TableCell className="pl-4 pr-5">
                        <button
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={() => openSubscriberSheet(sub.id)}
                        >
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {filteredSubscribers.length > 0 && (
              <div className="px-5 pb-4">
                <TablePagination currentPage={subscriberPage} totalItems={filteredSubscribers.length} pageSize={PAGE_SIZE} onPageChange={setSubscriberPage} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 2: Plans ── */}
        <TabsContent value="plans">
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {subscriptionPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="size-7 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No plans yet. Add your first subscription plan.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Plan Name
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Billing Cycle
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Item Cap
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Categories
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Subscribers
                    </TableHead>
                    <TableHead className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Active
                    </TableHead>
                    <TableHead className="pl-4 pr-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedPlans.map((plan) => (
                    <TableRow
                      key={plan.id}
                      className={cn(!plan.isActive && "opacity-50")}
                    >
                      <TableCell className="pl-5 pr-4">
                        <p className="text-sm font-medium text-foreground">
                          {plan.name}
                        </p>
                        {plan.description && (
                          <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                            {plan.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-4 text-sm font-medium tabular-nums text-foreground">
                        {formatNaira(plan.price)}
                      </TableCell>
                      <TableCell className="px-4 text-sm capitalize text-muted-foreground">
                        {plan.billingCycle}
                      </TableCell>
                      <TableCell className="px-4 text-sm tabular-nums text-foreground">
                        {plan.credits}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex flex-wrap gap-1">
                          {plan.categories.map((cat) => (
                            <span
                              key={cat}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {CATEGORY_LABELS[cat]}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-sm tabular-nums text-foreground">
                        {activeSubsByPlan[plan.id] ?? 0}
                      </TableCell>
                      <TableCell className="px-4">
                        <Switch
                          checked={plan.isActive}
                          onCheckedChange={() => togglePlanActive(plan.id)}
                          aria-label={`Toggle ${plan.name} plan`}
                        />
                      </TableCell>
                      <TableCell className="pl-4 pr-5">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(plan)}
                          >
                            <Pencil className="mr-1.5 size-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeletePlanId(plan.id)}
                          >
                            <Trash2 className="mr-1.5 size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {subscriptionPlans.length > 0 && (
              <div className="px-5 pb-4">
                <TablePagination currentPage={planPage} totalItems={subscriptionPlans.length} pageSize={PAGE_SIZE} onPageChange={setPlanPage} />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Plan Dialog ── */}
      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPlan={editingPlan}
        itemCategories={itemCategories}
        onSave={handleSavePlan}
      />

      {/* ── Delete AlertDialog ── */}
      <AlertDialog
        open={deletePlanId !== null}
        onOpenChange={(o) => { if (!o) setDeletePlanId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{planToDelete?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the plan. Existing subscribers will
              not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Subscriber Sheet ── */}
      <SubscriberSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        subscriber={viewingSubscriber}
        plan={viewingPlan}
      />

      {/* ── New Subscription Dialog ── */}
      <StartSubscriptionDialog
        open={newSubDialogOpen}
        onOpenChange={setNewSubDialogOpen}
      />
    </div>
  )
}
