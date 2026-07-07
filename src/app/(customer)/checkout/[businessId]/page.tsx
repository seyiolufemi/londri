"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { useGetBusinessByIdQuery } from "@/redux/api/businessApi"
import { useGetItemsQuery } from "@/redux/api/catalogApi"
import { useCreateCustomerOrderMutation, type CreateOrderRequest } from "@/redux/api/ordersApi"
import { normalizeNigerianPhone } from "@/lib/phone"
import { apiError } from "@/lib/apiError"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PICKUP_WINDOWS = [
  { value: "morning", label: "Morning (8am–12pm)" },
  { value: "afternoon", label: "Afternoon (12pm–4pm)" },
  { value: "evening", label: "Evening (4pm–8pm)" },
]

// Anchor hour used to turn the selected window into the scheduled_pickup_at
// timestamp the real API expects — there's no exact-time picker in this form.
const PICKUP_WINDOW_HOURS: Record<string, number> = { morning: 9, afternoon: 13, evening: 17 }

function buildScheduledPickupAt(window: string): string {
  const d = new Date()
  d.setHours(PICKUP_WINDOW_HOURS[window] ?? 9, 0, 0, 0)
  return d.toISOString()
}

interface GuestInfoErrors {
  fullName?: string
  whatsapp?: string
  email?: string
  pickupAddress?: string
  pickupTime?: string
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

export default function CheckoutPage() {
  const params = useParams<{ businessId: string }>()
  const router = useRouter()
  const businessId = params.businessId

  const { data: business, isLoading: businessLoading, isError: businessError } = useGetBusinessByIdQuery(businessId)
  const { data: itemsData, isLoading: itemsLoading } = useGetItemsQuery({ businessId })
  const items = useMemo(() => itemsData ?? [], [itemsData])

  const cart = useStore((s) => s.cart)
  const clearBusinessCart = useStore((s) => s.clearBusinessCart)

  const cartItems = useMemo(() => cart[businessId] ?? [], [cart, businessId])

  const rows = useMemo(
    () =>
      cartItems
        .map((i) => {
          const item = items.find((p) => p.id === i.priceListItemId)
          if (!item) return null
          return { name: item.name, quantity: i.quantity, lineTotal: item.price * i.quantity }
        })
        .filter((r): r is { name: string; quantity: number; lineTotal: number } => r !== null),
    [cartItems, items]
  )
  const total = rows.reduce((sum, r) => sum + r.lineTotal, 0)

  const isLoading = businessLoading || itemsLoading

  // Guard: nothing to check out (real backend confirmed business doesn't
  // exist, or the cart is empty) — wait for data to load before deciding.
  useEffect(() => {
    if (isLoading) return
    if (businessError || !business || cartItems.length === 0) {
      router.replace("/")
    }
  }, [isLoading, businessError, business, cartItems.length, router])

  // ── Guest info ──
  const [fullName, setFullName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [infoErrors, setInfoErrors] = useState<GuestInfoErrors>({})

  const [createCustomerOrder, { isLoading: isSubmitting }] = useCreateCustomerOrderMutation()

  function validateInfo(): boolean {
    const next: GuestInfoErrors = {}
    if (!fullName.trim()) next.fullName = "Full name is required"
    if (!whatsapp.trim()) next.whatsapp = "WhatsApp number is required"
    if (!email.trim()) next.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address"
    if (!pickupAddress.trim()) next.pickupAddress = "Pickup address is required"
    if (!pickupTime) next.pickupTime = "Select a preferred pickup time"
    setInfoErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleCheckout() {
    if (!validateInfo()) return

    const body: CreateOrderRequest = {
      business_id: businessId,
      items: cartItems.map((i) => ({ price_list_item_id: i.priceListItemId, quantity: i.quantity })),
      channel: "online_booking",
      customer_name: fullName.trim(),
      customer_email: email.trim(),
      customer_whatsapp: normalizeNigerianPhone(whatsapp),
      to_be_delivered: true,
      delivery_address: pickupAddress.trim(),
      scheduled_pickup_at: buildScheduledPickupAt(pickupTime),
    }

    try {
      const { checkout_link } = await createCustomerOrder(body).unwrap()
      clearBusinessCart(businessId)
      if (checkout_link) {
        window.location.href = checkout_link
      } else {
        toast.success("Order placed successfully")
        router.push("/")
      }
    } catch (error) {
      toast.error(apiError(error, "Couldn't place your order"))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-10">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-6 h-24 w-full rounded-lg" />
          <Skeleton className="mt-6 h-64 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!business) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
          Checkout with {business.name}
        </h1>

        {/* Order summary */}
        <div className="mt-6 rounded-lg bg-muted/30 p-4">
          {rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between py-1 text-sm">
              <span className="text-foreground">
                {row.name} <span className="text-muted-foreground">× {row.quantity}</span>
              </span>
              <span className="tabular-nums text-foreground">{formatNaira(row.lineTotal)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="tabular-nums text-foreground">{formatNaira(total)}</span>
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="full-name" className="mb-1.5 block text-sm">
              Full name
            </Label>
            <Input
              id="full-name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (infoErrors.fullName) setInfoErrors((er) => ({ ...er, fullName: undefined }))
              }}
              className={cn(infoErrors.fullName && "border-destructive")}
            />
            {infoErrors.fullName && (
              <p className="mt-1 text-xs text-destructive">{infoErrors.fullName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="whatsapp" className="mb-1.5 block text-sm">
              WhatsApp number
            </Label>
            <Input
              id="whatsapp"
              placeholder="+234 801 234 5678"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value)
                if (infoErrors.whatsapp) setInfoErrors((er) => ({ ...er, whatsapp: undefined }))
              }}
              className={cn(infoErrors.whatsapp && "border-destructive")}
            />
            {infoErrors.whatsapp && (
              <p className="mt-1 text-xs text-destructive">{infoErrors.whatsapp}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="mb-1.5 block text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (infoErrors.email) setInfoErrors((er) => ({ ...er, email: undefined }))
              }}
              className={cn(infoErrors.email && "border-destructive")}
            />
            {infoErrors.email && (
              <p className="mt-1 text-xs text-destructive">{infoErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pickup-address" className="mb-1.5 block text-sm">
              Pickup &amp; delivery address
            </Label>
            <Textarea
              id="pickup-address"
              placeholder="Where should we pick up and deliver your items?"
              value={pickupAddress}
              onChange={(e) => {
                setPickupAddress(e.target.value)
                if (infoErrors.pickupAddress)
                  setInfoErrors((er) => ({ ...er, pickupAddress: undefined }))
              }}
              rows={2}
              className={cn(infoErrors.pickupAddress && "border-destructive")}
            />
            {infoErrors.pickupAddress && (
              <p className="mt-1 text-xs text-destructive">{infoErrors.pickupAddress}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">Preferred pickup time</Label>
            <Select
              value={pickupTime}
              onValueChange={(v) => {
                setPickupTime(v)
                if (infoErrors.pickupTime) setInfoErrors((er) => ({ ...er, pickupTime: undefined }))
              }}
            >
              <SelectTrigger className={cn("w-full", infoErrors.pickupTime && "border-destructive")}>
                <SelectValue placeholder="Select a time window" />
              </SelectTrigger>
              <SelectContent>
                {PICKUP_WINDOWS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {infoErrors.pickupTime && (
              <p className="mt-1 text-xs text-destructive">{infoErrors.pickupTime}</p>
            )}
          </div>
        </div>

        <Button className="mt-6 w-full" onClick={handleCheckout} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
