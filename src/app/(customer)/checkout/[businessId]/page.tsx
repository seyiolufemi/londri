"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Loader2, MessageCircle } from "lucide-react"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { discoveryBusinesses, priceListItems } from "@/lib/mock/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Step = "info" | "payment" | "confirmation"
type PaymentMethod = "card" | "bank_transfer" | "ussd"

const PICKUP_WINDOWS = [
  { value: "morning", label: "Morning (8am–12pm)" },
  { value: "afternoon", label: "Afternoon (12pm–4pm)" },
  { value: "evening", label: "Evening (4pm–8pm)" },
]

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

  const business = discoveryBusinesses.find((b) => b.id === businessId)
  const cart = useStore((s) => s.cart)
  const clearBusinessCart = useStore((s) => s.clearBusinessCart)

  const cartItems = useMemo(() => cart[businessId] ?? [], [cart, businessId])

  const rows = useMemo(
    () =>
      cartItems
        .map((i) => {
          const item = priceListItems.find((p) => p.id === i.priceListItemId)
          if (!item) return null
          return { name: item.name, quantity: i.quantity, lineTotal: item.price * i.quantity }
        })
        .filter((r): r is { name: string; quantity: number; lineTotal: number } => r !== null),
    [cartItems]
  )
  const total = rows.reduce((sum, r) => sum + r.lineTotal, 0)

  const [step, setStep] = useState<Step>("info")

  // Guard: nothing to check out. Skipped once we reach confirmation, since
  // that step intentionally clears the cart as part of completing checkout.
  useEffect(() => {
    if ((!business || cartItems.length === 0) && step !== "confirmation") {
      router.replace("/")
    }
  }, [business, cartItems.length, step, router])

  // ── Step 1: Guest info ──
  const [fullName, setFullName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [infoErrors, setInfoErrors] = useState<GuestInfoErrors>({})

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

  function handleContinueToPayment() {
    if (!validateInfo()) return
    setStep("payment")
  }

  // ── Step 2: Payment ──
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [cardNumber, setCardNumber] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [reference, setReference] = useState("")

  function handlePay() {
    setIsPaying(true)
    setTimeout(() => {
      const randomRef = Math.floor(100000 + Math.random() * 900000).toString()
      setReference(`LDR-${randomRef}`)
      clearBusinessCart(businessId)
      setIsPaying(false)
      setStep("confirmation")
    }, 1500)
  }

  if (!business) return null

  const whatsappDigits = business.whatsappNumber.replace(/\D/g, "")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-xl px-6 py-10">
        {step === "info" && (
          <>
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
                  Pickup address
                </Label>
                <Textarea
                  id="pickup-address"
                  placeholder="Where should we pick up your items?"
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

            <Button className="mt-6 w-full" onClick={handleContinueToPayment}>
              Continue to Payment
            </Button>
          </>
        )}

        {step === "payment" && (
          <>
            <h1 className="text-xl font-semibold text-foreground">Payment</h1>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/30 p-4 text-sm font-semibold">
              <span className="text-foreground">Total</span>
              <span className="tabular-nums text-foreground">{formatNaira(total)}</span>
            </div>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              className="mt-6 flex flex-col gap-3"
            >
              {(
                [
                  { value: "card", label: "Card" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "ussd", label: "USSD" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  htmlFor={`pm-${opt.value}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                    paymentMethod === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={opt.value} id={`pm-${opt.value}`} />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>

            {paymentMethod === "card" && (
              <div className="mt-4">
                <Label htmlFor="card-number" className="mb-1.5 block text-sm">
                  Card number
                </Label>
                <Input
                  id="card-number"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
            )}

            <Button className="mt-6 w-full" onClick={handlePay} disabled={isPaying}>
              {isPaying && <Loader2 className="size-4 animate-spin" />}
              Pay {formatNaira(total)}
            </Button>
          </>
        )}

        {step === "confirmation" && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-10 text-primary" />
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-jakarta)] text-2xl font-bold text-foreground">
              Order confirmed!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Order reference: {reference}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A confirmation email has been sent to {email}
            </p>

            <Button className="mt-6" asChild>
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-1.5 size-4" />
                Message {business.name} on WhatsApp
              </a>
            </Button>

            <div className="mt-8 w-full border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">Want to track this order?</p>
              <Link
                href="/account/login"
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Sign in to view your orders
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <Link
              href="/"
              className="mt-6 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
