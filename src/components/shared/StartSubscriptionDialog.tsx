"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Landmark, Link as LinkIcon } from "lucide-react"
import type { CustomerSubscription, PriceCategory } from "@/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<PriceCategory, string> = {
  clothing: "Clothing",
  bedding: "Bedding",
  household: "Household",
  specialty: "Specialty",
}

const BILLING_SUFFIX: Record<string, string> = {
  weekly: "/week",
  monthly: "/month",
  quarterly: "/quarter",
  annually: "/year",
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

function getSubscriptionEndDate(start: Date, cycle: string): Date {
  const end = new Date(start)
  if (cycle === "weekly") end.setDate(end.getDate() + 7)
  else if (cycle === "monthly") end.setMonth(end.getMonth() + 1)
  else if (cycle === "quarterly") end.setMonth(end.getMonth() + 3)
  else end.setFullYear(end.getFullYear() + 1)
  return end
}

type SubPaymentMethod = "counter" | "link"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrefilledCustomer {
  name: string
  phone: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefilledCustomer?: PrefilledCustomer
  onSubscriptionCreated?: (sub: CustomerSubscription) => void
}

interface StandaloneErrors {
  name?: string
  phone?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StartSubscriptionDialog({
  open,
  onOpenChange,
  prefilledCustomer,
  onSubscriptionCreated,
}: Props) {
  const subscriptionPlans = useStore((s) => s.subscriptionPlans)
  const addCustomerSubscription = useStore((s) => s.addCustomerSubscription)

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [localName, setLocalName] = useState("")
  const [localPhone, setLocalPhone] = useState("")
  const [errors, setErrors] = useState<StandaloneErrors>({})
  const [paymentMethod, setPaymentMethod] = useState<SubPaymentMethod>("counter")

  useEffect(() => {
    if (open) {
      setSelectedPlanId(null)
      setLocalName("")
      setLocalPhone("")
      setErrors({})
      setPaymentMethod("counter")
    }
  }, [open])

  const activePlans = useMemo(
    () => subscriptionPlans.filter((p) => p.isActive),
    [subscriptionPlans]
  )

  const selectedPlan = selectedPlanId
    ? (activePlans.find((p) => p.id === selectedPlanId) ?? null)
    : null

  const customerLabel = prefilledCustomer
    ? (prefilledCustomer.name.trim() || "this customer")
    : (localName.trim() || "this customer")

  const confirmLabel =
    paymentMethod === "link" ? "Send Payment Link & Activate" : "Activate Subscription"

  function handleConfirm() {
    if (!prefilledCustomer) {
      const newErrors: StandaloneErrors = {}
      if (!localName.trim()) newErrors.name = "Customer name is required"
      if (!localPhone.trim()) newErrors.phone = "WhatsApp number is required"
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
    }

    if (!selectedPlanId || !selectedPlan) return

    const name = prefilledCustomer?.name.trim() || localName.trim() || "Customer"
    const phone = prefilledCustomer?.phone.trim() || localPhone.trim()

    const now = new Date()
    const endDate = getSubscriptionEndDate(now, selectedPlan.billingCycle)
    const nowIso = now.toISOString()
    const endIso = endDate.toISOString()

    const newSub: CustomerSubscription = {
      id: `sub_${Date.now()}`,
      customerId: `cust_${Date.now()}`,
      customerName: name,
      customerPhone: phone,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      // Simplified for demo: both payment paths activate immediately.
      // In production, "send payment link" would set status to "paused" or
      // a pending state and activate only after payment webhook confirmation.
      status: "active",
      creditsUsed: 0,
      creditsTotal: selectedPlan.credits,
      startDate: nowIso,
      endDate: endIso,
      nextBillingDate: endIso,
    }

    addCustomerSubscription(newSub)
    onSubscriptionCreated?.(newSub)
    onOpenChange(false)

    const firstName = name.split(" ")[0]
    const planDesc = `${selectedPlan.name} — ${formatNaira(selectedPlan.price)}${BILLING_SUFFIX[selectedPlan.billingCycle] ?? "/month"}`

    if (paymentMethod === "link") {
      toast.success("Payment link sent — subscription will activate once paid", {
        description: planDesc,
      })
    } else {
      toast.success(`Subscription activated for ${firstName}`, {
        description: planDesc,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start a Subscription</DialogTitle>
          {prefilledCustomer && (
            <p className="text-sm text-muted-foreground">
              Subscribe {customerLabel} to a plan
            </p>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {/* Standalone customer fields — only shown when no prefilledCustomer */}
          {!prefilledCustomer && (
            <div className="flex flex-col gap-3 border-b border-border pb-3">
              <div>
                <Label htmlFor="sub-dialog-name" className="mb-1.5 block text-sm">
                  Customer full name
                </Label>
                <Input
                  id="sub-dialog-name"
                  placeholder="Customer's full name"
                  value={localName}
                  onChange={(e) => {
                    setLocalName(e.target.value)
                    if (errors.name) setErrors((er) => ({ ...er, name: undefined }))
                  }}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="sub-dialog-phone" className="mb-1.5 block text-sm">
                  WhatsApp number
                </Label>
                <Input
                  id="sub-dialog-phone"
                  placeholder="+234 801 234 5678"
                  value={localPhone}
                  onChange={(e) => {
                    setLocalPhone(e.target.value)
                    if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }))
                  }}
                  className={cn(errors.phone && "border-destructive")}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Plan selector cards */}
          {activePlans.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No active plans available. Add plans in Subscriptions.
            </p>
          ) : (
            activePlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-colors",
                  selectedPlanId === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {plan.name}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatNaira(plan.price)}
                    <span className="font-normal text-muted-foreground">
                      {BILLING_SUFFIX[plan.billingCycle] ?? "/month"}
                    </span>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {plan.credits} items
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  {plan.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}

          {/* Payment method — revealed once a plan is chosen */}
          {selectedPlan && (
            <div className="mt-4">
              <p className="mb-1 text-sm font-semibold text-foreground">
                Payment for First Cycle
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Collect payment for the first billing cycle to activate this subscription.
              </p>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as SubPaymentMethod)}
                className="flex flex-col gap-3"
              >
                {/* Customer paid at counter */}
                <label
                  htmlFor="sub-method-counter"
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
                    paymentMethod === "counter"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value="counter" id="sub-method-counter" />
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Landmark className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Customer paid at counter
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Customer has paid via bank transfer to your virtual account
                    </p>
                  </div>
                </label>

                {/* Send payment link */}
                <label
                  htmlFor="sub-method-link"
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
                    paymentMethod === "link"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value="link" id="sub-method-link" />
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
              </RadioGroup>
            </div>
          )}

          {/* Summary line */}
          {selectedPlan && (
            <p className="text-sm text-muted-foreground">
              This will subscribe {customerLabel} to{" "}
              <span className="font-medium text-foreground">{selectedPlan.name}</span>{" "}
              for {formatNaira(selectedPlan.price)}
              {BILLING_SUFFIX[selectedPlan.billingCycle] ?? "/month"}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={selectedPlanId === null} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
