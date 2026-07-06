"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, MapPin, MessageCircle, Minus, Plus, ShoppingCart, X } from "lucide-react"
import Navbar from "@/components/customer/Navbar"
import { useStore } from "@/lib/mock/store"
import { discoveryBusinesses, priceListItems } from "@/lib/mock/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { PriceCategory, ServiceType } from "@/types"

const CATEGORY_LABELS: Record<PriceCategory, string> = {
  clothing: "Clothing",
  bedding: "Bedding",
  household: "Household",
  specialty: "Specialty",
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  wash: "Wash",
  dry_clean: "Dry Clean",
  iron: "Iron",
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAY_LABELS: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":")
  const hour = Number(hStr)
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${mStr} ${period}`
}

// ─── Request a Quote dialog ────────────────────────────────────────────────────

type QuoteStep = "form" | "confirmation"

interface QuoteFormErrors {
  fullName?: string
  whatsapp?: string
  message?: string
}

interface RequestQuoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessName: string
  whatsappNumber: string
}

function RequestQuoteDialog({
  open,
  onOpenChange,
  businessName,
  whatsappNumber,
}: RequestQuoteDialogProps) {
  const [step, setStep] = useState<QuoteStep>("form")
  const [fullName, setFullName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<QuoteFormErrors>({})

  const whatsappDigits = whatsappNumber.replace(/\D/g, "")

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Reset back to the request form for next time, per spec.
      setStep("form")
      setFullName("")
      setWhatsapp("")
      setMessage("")
      setErrors({})
    }
    onOpenChange(next)
  }

  function handleSendRequest() {
    const next: QuoteFormErrors = {}
    if (!fullName.trim()) next.fullName = "Full name is required"
    if (!whatsapp.trim()) next.whatsapp = "WhatsApp number is required"
    if (!message.trim()) next.message = "Tell us what you need"
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setStep("confirmation")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Request a Quote from {businessName}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Tell us what you need and we&apos;ll get back to you.
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div>
                <Label htmlFor="quote-name" className="mb-1.5 block text-sm">
                  Full name
                </Label>
                <Input
                  id="quote-name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (errors.fullName) setErrors((er) => ({ ...er, fullName: undefined }))
                  }}
                  className={cn(errors.fullName && "border-destructive")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="quote-whatsapp" className="mb-1.5 block text-sm">
                  WhatsApp number
                </Label>
                <Input
                  id="quote-whatsapp"
                  placeholder="+234 801 234 5678"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value)
                    if (errors.whatsapp) setErrors((er) => ({ ...er, whatsapp: undefined }))
                  }}
                  className={cn(errors.whatsapp && "border-destructive")}
                />
                {errors.whatsapp && (
                  <p className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>
                )}
              </div>

              <div>
                <Label htmlFor="quote-message" className="mb-1.5 block text-sm">
                  Message
                </Label>
                <Textarea
                  id="quote-message"
                  placeholder="Describe what you need — e.g. '2 bags of mixed clothing, need dry cleaning'"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (errors.message) setErrors((er) => ({ ...er, message: undefined }))
                  }}
                  rows={3}
                  className={cn(errors.message && "border-destructive")}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendRequest}>Send Request</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="size-8 text-primary" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">Request sent!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ve notified {businessName}. You can also reach them directly below.
            </p>

            <Button className="mt-6 w-full" asChild>
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-1.5 size-4" />
                Message {businessName} on WhatsApp
              </a>
            </Button>

            <Button variant="outline" className="mt-2 w-full" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function LaundryDetailPage() {
  const params = useParams<{ id: string }>()
  const business = discoveryBusinesses.find((b) => b.id === params.id)

  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const updateCartItemQuantity = useStore((s) => s.updateCartItemQuantity)
  const setCartSheetOpen = useStore((s) => s.setCartSheetOpen)

  const [categoryFilter, setCategoryFilter] = useState<PriceCategory | "all">("all")
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false)

  const items = useMemo(() => {
    if (!business) return []
    const ids = new Set(business.itemIds)
    return priceListItems.filter((item) => ids.has(item.id) && item.isActive)
  }, [business])

  const categories = useMemo(() => {
    const set = new Set<PriceCategory>()
    items.forEach((item) => set.add(item.category))
    return Array.from(set)
  }, [items])

  const filteredItems = useMemo(() => {
    if (categoryFilter === "all") return items
    return items.filter((item) => item.category === categoryFilter)
  }, [items, categoryFilter])

  const businessCart = business ? (cart[business.id] ?? []) : []
  const cartCount = businessCart.reduce((sum, i) => sum + i.quantity, 0)
  const cartSubtotal = businessCart.reduce((sum, i) => {
    const item = priceListItems.find((p) => p.id === i.priceListItemId)
    return sum + (item ? item.price * i.quantity : 0)
  }, 0)

  function getQuantity(itemId: string): number {
    return businessCart.find((i) => i.priceListItemId === itemId)?.quantity ?? 0
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-medium text-foreground">Laundry not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This laundry may have been removed or the link is incorrect.
          </p>
          <Link href="/" className="mt-4 text-sm font-medium text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />

      {/* ── Section 1: Business Header ── */}
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-10 md:flex-row md:items-start">
        {/* Illustration */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/illustrations/washing-machines/${business.illustrationVariant}`}
          alt=""
          aria-hidden="true"
          className="h-52 w-auto shrink-0 object-contain md:h-56"
        />

        {/* Details */}
        <div className="min-w-0 flex-1 text-center md:text-left">
          <h1 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-foreground md:text-3xl">
            {business.name}
          </h1>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground md:justify-start">
            <span>{business.distanceKm}km away</span>
            <span>·</span>
            {business.isOpen ? (
              <span className="flex items-center gap-1.5 text-green-600">
                <span className="size-1.5 rounded-full bg-green-500" />
                Open now
              </span>
            ) : (
              <span>Closed</span>
            )}
          </div>

          {/* Operating hours */}
          <div className="mx-auto mt-4 max-w-xs text-sm md:mx-0">
            {WEEK_DAYS.map((day) => {
              const dayHours = business.operatingHours[day]
              return (
                <div
                  key={day}
                  className="flex items-center justify-between gap-4 border-b border-border py-1.5 last:border-0"
                >
                  <span className="text-muted-foreground">{DAY_LABELS[day]}</span>
                  <span className="text-foreground">
                    {dayHours?.open
                      ? `${formatTime(dayHours.openTime)} – ${formatTime(dayHours.closeTime)}`
                      : "Closed"}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Address */}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground md:justify-start">
            <MapPin className="size-3.5 shrink-0" />
            {business.address}
          </p>
        </div>
      </div>

      {/* ── Section 2: Services & Pricing ── */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Services &amp; Pricing
          </h2>
          <button
            type="button"
            onClick={() => setQuoteDialogOpen(true)}
            className="cursor-pointer text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            Got a lot of laundry? Request a quote instead
          </button>
        </div>

        {/* Category filter — only shown when it would actually filter something */}
        {categories.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                categoryFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        )}

        <div>
          {filteredItems.map((item) => {
            const quantity = getQuantity(item.id)
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0"
              >
                {/* Left: name, badges, unit */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    {item.serviceTypes.map((st) => (
                      <span
                        key={st}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {SERVICE_TYPE_LABELS[st]}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.unit}</p>
                </div>

                {/* Middle: price */}
                <p className="shrink-0 text-base font-semibold tabular-nums text-foreground">
                  {formatNaira(item.price)}
                </p>

                {/* Right: Add button or stepper + remove */}
                <div className="flex shrink-0 items-center gap-2">
                  {quantity === 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToCart(business.id, item.id, 1)}
                    >
                      Add
                    </Button>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 rounded-md border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQuantity(business.id, item.id, quantity - 1)
                          }
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-5 text-center text-sm tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQuantity(business.id, item.id, quantity + 1)
                          }
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(business.id, item.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Sticky "View Cart" bar ── */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setCartSheetOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-primary/90"
          >
            View Cart ({cartCount} item{cartCount === 1 ? "" : "s"}) · {formatNaira(cartSubtotal)}
            <ShoppingCart className="size-4" />
          </button>
        </div>
      )}

      {/* ── Request a Quote ── */}
      <RequestQuoteDialog
        open={quoteDialogOpen}
        onOpenChange={setQuoteDialogOpen}
        businessName={business.name}
        whatsappNumber={business.whatsappNumber}
      />
    </div>
  )
}
