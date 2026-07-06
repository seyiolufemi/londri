"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import { useGetCategoriesQuery, useGetItemsQuery, useGetPlansForBusinessQuery } from "@/redux/api/catalogApi"
import { useCreateOrderMutation, type CreateOrderRequest, type OrderChannel } from "@/redux/api/ordersApi"
import { apiError } from "@/lib/apiError"
import { normalizeNigerianPhone } from "@/lib/phone"
import { Button } from "@/components/ui/button"
import type { CustomerSubscription } from "@/types"
import CustomerSection from "@/components/orders/new/CustomerSection"
import ItemPickerSection, { type AddedItem } from "@/components/orders/new/ItemPickerSection"
import PaymentMethodSection, { type PaymentMethod } from "@/components/orders/new/PaymentMethodSection"
import StartSubscriptionDialog from "@/components/shared/StartSubscriptionDialog"

interface FormErrors {
  name?: string
  phone?: string
  items?: string
}

// No real customer-subscription lookup endpoint exists yet — flip this once the
// backend confirms one, to re-enable phone-based detection and "Bill to Subscription".
const SUBSCRIPTION_DETECTION_ENABLED = false

// Matches the mock customer-subscription store's phone format — the phone
// lookup itself is still mock (no real customer-subscription endpoint yet).
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("234") && digits.length >= 13) {
    return "0" + digits.slice(3)
  }
  return digits
}

export default function CreateOrderPage() {
  const router = useRouter()
  const { data: business } = useGetMyBusinessQuery()
  const businessId = business?.id

  const { data: categoriesData } = useGetCategoriesQuery(businessId ?? "", { skip: !businessId })
  const categories = useMemo(() => categoriesData ?? [], [categoriesData])
  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  const { data: itemsData, isLoading: itemsLoading } = useGetItemsQuery(
    { businessId: businessId ?? "" },
    { skip: !businessId }
  )
  const activeItems = useMemo(() => (itemsData ?? []).filter((i) => i.is_active), [itemsData])

  const { data: plansData } = useGetPlansForBusinessQuery(businessId ?? "", { skip: !businessId })
  const subscriptionPlans = useMemo(() => plansData ?? [], [plansData])

  // Mock — no customer-subscription endpoint exists yet.
  const customerSubscriptions = useStore((s) => s.customerSubscriptions)

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation()

  // ── Customer fields ──
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // ── Subscription lookup ──
  const [detectedSub, setDetectedSub] = useState<CustomerSubscription | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!SUBSCRIPTION_DETECTION_ENABLED) return
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
  const showSubTrigger = SUBSCRIPTION_DETECTION_ENABLED && phoneDigits.length >= 10 && detectedSub === null

  // ── Items ──
  const [addedItems, setAddedItems] = useState<AddedItem[]>([])

  function addItem(item: (typeof activeItems)[number]) {
    setAddedItems((prev) => {
      const existing = prev.find((i) => i.priceListItemId === item.id)
      if (existing) {
        return prev.map((i) =>
          i.priceListItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          priceListItemId: item.id,
          name: item.name,
          categoryId: item.category_id,
          quantity: 1,
          unitPrice: item.price,
        },
      ]
    })
    if (errors.items) setErrors((e) => ({ ...e, items: undefined }))
  }

  function removeItem(id: string) {
    setAddedItems((prev) => prev.filter((i) => i.priceListItemId !== id))
  }

  function updateQuantity(id: string, delta: number) {
    setAddedItems((prev) =>
      prev.map((i) =>
        i.priceListItemId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
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
  const eligibleCategoryNames: string[] = detectedPlan?.eligible_categories ?? []
  const remainingCredits = detectedSub ? detectedSub.creditsTotal - detectedSub.creditsUsed : 0
  const subDisabled = detectedSub !== null && remainingCredits <= 0

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("counter")

  // Default to the detected subscription (unless disabled) each time detection changes,
  // adjusted during render rather than in an effect (see react-hooks/set-state-in-effect).
  const [lastDetectedSubId, setLastDetectedSubId] = useState<string | null>(null)
  const detectedSubId = detectedSub?.id ?? null
  if (detectedSubId !== lastDetectedSubId) {
    setLastDetectedSubId(detectedSubId)
    setPaymentMethod(detectedSub && !subDisabled ? "subscription" : "counter")
  }

  // ── Errors ──
  const [errors, setErrors] = useState<FormErrors>({})

  // ── Submit ──
  async function handleSubmit() {
    const newErrors: FormErrors = {}
    if (!customerName.trim()) newErrors.name = "Customer name is required"
    if (!customerPhone.trim()) newErrors.phone = "WhatsApp number is required"
    if (addedItems.length === 0) newErrors.items = "Add at least one item"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    if (!business) return

    const channel: OrderChannel = paymentMethod === "subscription" ? "subscription_fulfillment" : "walk_in"

    const body: CreateOrderRequest = {
      business_id: business.id,
      items: addedItems.map((i) => ({ price_list_item_id: i.priceListItemId, quantity: i.quantity })),
      channel,
      customer_name: customerName.trim(),
      customer_whatsapp: normalizeNigerianPhone(customerPhone),
      to_be_delivered: false,
      ...(customerEmail.trim() && { customer_email: customerEmail.trim() }),
    }

    try {
      const { order, checkout_link } = await createOrder(body).unwrap()
      if (checkout_link) {
        try {
          await navigator.clipboard.writeText(checkout_link)
          toast.success("Order created — payment link copied to clipboard", {
            description: order.reference_id,
          })
        } catch {
          toast.success("Order created successfully", { description: order.reference_id })
        }
      } else {
        toast.success("Order created successfully", { description: order.reference_id })
      }
      router.push("/orders")
    } catch (error) {
      toast.error(apiError(error, "Couldn't create order"))
    }
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
        <CustomerSection
          name={customerName}
          phone={customerPhone}
          email={customerEmail}
          onNameChange={(v) => {
            setCustomerName(v)
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }))
          }}
          onPhoneChange={(v) => {
            setCustomerPhone(v)
            if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }))
          }}
          onEmailChange={setCustomerEmail}
          nameError={errors.name}
          phoneError={errors.phone}
          detectedSub={detectedSub}
          remainingCredits={remainingCredits}
          showSubTrigger={showSubTrigger}
          onStartSubscriptionClick={() => setSubDialogOpen(true)}
        />

        <ItemPickerSection
          items={activeItems}
          isLoading={itemsLoading}
          categoryNameById={categoryNameById}
          addedItems={addedItems}
          eligibleCategoryNames={eligibleCategoryNames}
          hasActiveSubscription={detectedSub !== null}
          totalAmount={totalAmount}
          error={errors.items}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onUpdateQuantity={updateQuantity}
        />

        <PaymentMethodSection
          value={paymentMethod}
          onChange={setPaymentMethod}
          detectedSub={detectedSub}
          subDisabled={subDisabled}
        />

        {/* ── Section 4: Create ── */}
        <Button className="mt-2 w-full" onClick={handleSubmit} disabled={isCreating}>
          {isCreating && <Loader2 className="size-4 animate-spin" />}
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
