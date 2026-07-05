"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  BadgeCheck,
  Minus,
  Plus,
  X,
  Landmark,
  Link as LinkIcon,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type {
  Order,
  OrderItem,
  OrderStatusEvent,
  CustomerSubscription,
  PriceListItem,
  PriceCategory,
  Transaction,
} from "@/types"
import StartSubscriptionDialog from "@/components/shared/StartSubscriptionDialog"

// ─── Constants ────────────────────────────────────────────────────────────────

type PaymentMethod = "counter" | "link" | "subscription"

const CATEGORY_LABELS: Record<PriceCategory, string> = {
  clothing: "Clothing",
  bedding: "Bedding",
  household: "Household",
  specialty: "Specialty",
}

interface AddedItem {
  priceListItemId: string
  name: string
  category: PriceCategory
  quantity: number
  unitPrice: number
}

interface FormErrors {
  name?: string
  phone?: string
  items?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("234") && digits.length >= 13) {
    return "0" + digits.slice(3)
  }
  return digits
}

function generateReference(ordersLength: number): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const seq = String(ordersLength + 1).padStart(4, "0")
  return `LDR-${y}${m}${d}-${seq}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateOrderPage() {
  const router = useRouter()
  const { data: business } = useGetMyBusinessQuery()

  const orders = useStore((s) => s.orders)
  const priceListItems = useStore((s) => s.priceListItems)
  const subscriptionPlans = useStore((s) => s.subscriptionPlans)
  const customerSubscriptions = useStore((s) => s.customerSubscriptions)
  const addOrder = useStore((s) => s.addOrder)
  const addOrderStatusEvent = useStore((s) => s.addOrderStatusEvent)
  const addTransaction = useStore((s) => s.addTransaction)

  // ── Customer fields ──
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // ── Subscription lookup ──
  const [detectedSub, setDetectedSub] = useState<CustomerSubscription | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const normalized = normalizePhone(customerPhone)
      if (normalized.length < 10) {
        setDetectedSub(null)
        return
      }
      const match = customerSubscriptions.find(
        (s) => s.status === "active" && normalizePhone(s.customerPhone) === normalized
      )
      setDetectedSub(match ?? null)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [customerPhone, customerSubscriptions])

  // ── Start Subscription dialog ──
  const [subDialogOpen, setSubDialogOpen] = useState(false)

  const phoneDigits = normalizePhone(customerPhone)
  const showSubTrigger = phoneDigits.length >= 10 && detectedSub === null

  // ── Items ──
  const [addedItems, setAddedItems] = useState<AddedItem[]>([])
  const [itemSearch, setItemSearch] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const activeItems = useMemo(
    () => priceListItems.filter((i) => i.isActive),
    [priceListItems]
  )
  const filteredItems = useMemo(() => {
    const q = itemSearch.toLowerCase()
    return q
      ? activeItems.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
        )
      : activeItems
  }, [activeItems, itemSearch])

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function addItem(item: PriceListItem) {
    setAddedItems((prev) => {
      const existing = prev.find((i) => i.priceListItemId === item.id)
      if (existing) {
        return prev.map((i) =>
          i.priceListItemId === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [
        ...prev,
        {
          priceListItemId: item.id,
          name: item.name,
          category: item.category,
          quantity: 1,
          unitPrice: item.price,
        },
      ]
    })
    setItemSearch("")
    setPickerOpen(false)
    if (errors.items) setErrors((e) => ({ ...e, items: undefined }))
  }

  function removeItem(id: string) {
    setAddedItems((prev) => prev.filter((i) => i.priceListItemId !== id))
  }

  function updateQuantity(id: string, delta: number) {
    setAddedItems((prev) =>
      prev.map((i) =>
        i.priceListItemId === id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    )
  }

  const totalAmount = useMemo(
    () => addedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [addedItems]
  )

  // ── Payment method ──
  const detectedPlan = detectedSub
    ? (subscriptionPlans.find((p) => p.id === detectedSub.planId) ?? null)
    : null
  const eligibleCategories: PriceCategory[] = detectedPlan?.categories ?? []
  const remainingCredits = detectedSub
    ? detectedSub.creditsTotal - detectedSub.creditsUsed
    : 0
  const subDisabled = detectedSub !== null && remainingCredits <= 0

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("counter")

  // When subscription is detected, default to it (unless disabled)
  useEffect(() => {
    if (detectedSub && !subDisabled) {
      setPaymentMethod("subscription")
    } else if (!detectedSub) {
      setPaymentMethod("counter")
    }
  }, [detectedSub, subDisabled])

  // ── Errors ──
  const [errors, setErrors] = useState<FormErrors>({})

  // ── Submit ──
  function handleSubmit() {
    const newErrors: FormErrors = {}
    if (!customerName.trim()) newErrors.name = "Customer name is required"
    if (!customerPhone.trim()) newErrors.phone = "WhatsApp number is required"
    if (addedItems.length === 0) newErrors.items = "Add at least one item"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const now = new Date().toISOString()
    const reference = generateReference(orders.length)
    const orderId = `ord_${Date.now()}`

    const items: OrderItem[] = addedItems.map((i) => ({
      priceListItemId: i.priceListItemId,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.unitPrice * i.quantity,
    }))

    const newOrder: Order = {
      id: orderId,
      reference,
      customerId: `cust_${Date.now()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items,
      totalAmount,
      status: "confirmed",
      channel: paymentMethod === "subscription" ? "subscription" : "walk_in",
      paymentStatus: paymentMethod === "counter" ? "paid" : "unpaid",
      pickupAddress: "",
      deliveryAddress: "",
      pickupDate: now,
      estimatedDeliveryDate: now,
      actualDeliveryDate: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    }

    const confirmedEvent: OrderStatusEvent = {
      id: `evt_${Date.now()}`,
      orderId,
      status: "confirmed",
      note: "Order created at counter",
      createdAt: now,
      createdBy: "staff",
    }

    addOrder(newOrder)
    addOrderStatusEvent(confirmedEvent)

    if (paymentMethod === "counter") {
      const randomRef = Math.floor(100000 + Math.random() * 900000).toString()
      const txn: Transaction = {
        id: `txn_${Date.now()}`,
        reference: `NMB-${randomRef}`,
        orderId,
        customerName: customerName.trim(),
        type: "payment",
        amount: totalAmount,
        status: "successful",
        channel: "bank_transfer",
        description: `Payment for ${reference}`,
        matchStatus: "matched",
        resolutionNote: null,
        createdAt: now,
      }
      addTransaction(txn)
    }

    toast.success("Order created successfully", { description: reference })
    router.push("/orders")
  }

  // ── Blocked state ────────────────────────────────────────────────────────────

  if (business?.current_kyb_status !== "verified") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Lock className="size-8 text-muted-foreground" />
        <p className="mt-3 text-base font-medium text-foreground">
          Complete verification to create orders
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll be able to create orders once your business is verified.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/orders")}>
          Back to Orders
        </Button>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const submitLabel =
    paymentMethod === "link"
      ? "Create Order & Send Payment Link"
      : paymentMethod === "subscription"
      ? "Create Order & Deduct from Subscription"
      : "Create Order"

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back navigation */}
      <button
        onClick={() => router.push("/orders")}
        className="mb-5 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to Orders
      </button>

      {/* Page heading */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
          Create Order
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Create an order for a walk-in or subscription customer
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Section 1: Customer ── */}
        <section className="rounded-xl border border-border bg-background p-6">
          <h3 className="mb-4 text-base font-semibold text-foreground">Customer</h3>
          <div className="flex flex-col gap-4">
            {/* Full name */}
            <div>
              <Label htmlFor="customer-name" className="mb-1.5 block text-sm">
                Full name
              </Label>
              <Input
                id="customer-name"
                placeholder="Customer's full name"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                  if (errors.name) setErrors((er) => ({ ...er, name: undefined }))
                }}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* WhatsApp number */}
            <div>
              <Label htmlFor="customer-phone" className="mb-1.5 block text-sm">
                WhatsApp number
              </Label>
              <Input
                id="customer-phone"
                placeholder="+234 801 234 5678"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value)
                  if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }))
                }}
                className={cn(errors.phone && "border-destructive")}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
              )}

              {/* Active subscription card */}
              {detectedSub && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-2.5">
                    <BadgeCheck className="mt-0.5 size-[18px] shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {detectedSub.planName} Plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {remainingCredits} of {detectedSub.creditsTotal} items
                        remaining this cycle
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Active
                  </span>
                </div>
              )}
            </div>

            {/* Email (optional) */}
            <div>
              <Label htmlFor="customer-email" className="mb-1.5 block text-sm">
                Email{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="customer-email"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            {/* Start subscription trigger — visible when phone entered but no active sub found */}
            {showSubTrigger && (
              <button
                type="button"
                onClick={() => setSubDialogOpen(true)}
                className="mt-1 self-start text-sm text-primary hover:underline"
              >
                Not a subscriber? Start a subscription for this customer &rarr;
              </button>
            )}
          </div>
        </section>

        {/* ── Section 2: Items & Pricing ── */}
        <section className="rounded-xl border border-border bg-background p-6">
          <h3 className="mb-4 text-base font-semibold text-foreground">
            Items &amp; Pricing
          </h3>

          {/* Item picker */}
          <div ref={pickerRef} className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items to add…"
                className={cn("pl-9", errors.items && "border-destructive")}
                value={itemSearch}
                onFocus={() => setPickerOpen(true)}
                onChange={(e) => {
                  setItemSearch(e.target.value)
                  setPickerOpen(true)
                }}
              />
            </div>
            {errors.items && (
              <p className="mt-1 text-xs text-destructive">{errors.items}</p>
            )}

            {pickerOpen && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
                {filteredItems.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted-foreground">
                    No items found
                  </p>
                ) : (
                  filteredItems.map((item) => {
                    const alreadyAdded = addedItems.some(
                      (a) => a.priceListItemId === item.id
                    )
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addItem(item)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted",
                          alreadyAdded && "opacity-50"
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[item.category]}
                          </p>
                        </div>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {formatNaira(item.price)}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Added items list */}
          {addedItems.length > 0 && (
            <div className="mb-3">
              {addedItems.map((item) => {
                const notCovered =
                  detectedSub !== null &&
                  eligibleCategories.length > 0 &&
                  !eligibleCategories.includes(item.category)
                return (
                  <div
                    key={item.priceListItemId}
                    className="flex items-center justify-between border-b border-border py-2 last:border-0"
                  >
                    {/* Left: name + category */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[item.category]}
                      </p>
                      {notCovered && (
                        <p className="text-xs text-amber-600">
                          Not covered by subscription
                        </p>
                      )}
                    </div>

                    {/* Middle: quantity stepper */}
                    <div className="mx-4 flex w-24 items-center justify-between rounded-md border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.priceListItemId, -1)}
                        className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="text-sm tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.priceListItemId, 1)}
                        className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    {/* Right: line total + remove */}
                    <div className="flex items-center gap-2">
                      <span className="w-24 text-right text-sm font-medium tabular-nums text-foreground">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.priceListItemId)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Total row */}
          {addedItems.length > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="font-[family-name:var(--font-jakarta)] text-lg font-bold tabular-nums text-foreground">
                {formatNaira(totalAmount)}
              </span>
            </div>
          )}
        </section>

        {/* ── Section 3: Payment Method ── */}
        <section className="rounded-xl border border-border bg-background p-6">
          <h3 className="mb-4 text-base font-semibold text-foreground">
            Payment Method
          </h3>

          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            className="flex flex-col gap-3"
          >
            {/* Pay now at counter */}
            <label
              htmlFor="method-counter"
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
                paymentMethod === "counter"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <RadioGroupItem value="counter" id="method-counter" />
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Landmark className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Pay now at counter
                </p>
                <p className="text-xs text-muted-foreground">
                  Customer pays via bank transfer to your virtual account
                </p>
              </div>
            </label>

            {/* Send payment link */}
            <label
              htmlFor="method-link"
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
                paymentMethod === "link"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <RadioGroupItem value="link" id="method-link" />
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <LinkIcon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Send payment link
                </p>
                <p className="text-xs text-muted-foreground">
                  Generate a Nomba payment link to send via WhatsApp
                </p>
              </div>
            </label>

            {/* Bill to subscription — only when detected */}
            {detectedSub && (
              <label
                htmlFor="method-subscription"
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                  subDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer",
                  paymentMethod === "subscription" && !subDisabled
                    ? "border-primary bg-primary/5"
                    : "border-border",
                  !subDisabled && "hover:bg-muted/50"
                )}
              >
                <RadioGroupItem
                  value="subscription"
                  id="method-subscription"
                  disabled={subDisabled}
                />
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <RefreshCw className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Bill to subscription
                  </p>
                  {subDisabled ? (
                    <p className="text-xs text-destructive">
                      Not enough credits remaining
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Deduct from customer&apos;s active plan
                    </p>
                  )}
                </div>
              </label>
            )}
          </RadioGroup>
        </section>

        {/* ── Section 4: Create ── */}
        <Button className="mt-2 w-full" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>

      {/* ── Start Subscription Dialog ── */}
      <StartSubscriptionDialog
        open={subDialogOpen}
        onOpenChange={setSubDialogOpen}
        prefilledCustomer={{ name: customerName, phone: customerPhone }}
        onSubscriptionCreated={setDetectedSub}
      />
    </div>
  )
}
