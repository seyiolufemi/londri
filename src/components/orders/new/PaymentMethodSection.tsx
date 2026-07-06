import { Landmark, Link as LinkIcon, RefreshCw } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { CustomerSubscription } from "@/types"

export type PaymentMethod = "counter" | "link" | "subscription"

interface PaymentMethodSectionProps {
  value: PaymentMethod
  onChange: (v: PaymentMethod) => void
  detectedSub: CustomerSubscription | null
  subDisabled: boolean
}

export default function PaymentMethodSection({
  value,
  onChange,
  detectedSub,
  subDisabled,
}: PaymentMethodSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Payment Method</h3>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as PaymentMethod)}
        className="flex flex-col gap-3"
      >
        {/* Pay now at counter */}
        <label
          htmlFor="method-counter"
          className={cn(
            "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
            value === "counter" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          )}
        >
          <RadioGroupItem value="counter" id="method-counter" />
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Landmark className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Pay now at counter</p>
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
            value === "link" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          )}
        >
          <RadioGroupItem value="link" id="method-link" />
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <LinkIcon className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Send payment link</p>
            <p className="text-xs text-muted-foreground">
              Generate a payment link to send via WhatsApp
            </p>
          </div>
        </label>

        {/* Bill to subscription — only when detected */}
        {detectedSub && (
          <label
            htmlFor="method-subscription"
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 transition-colors",
              subDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              value === "subscription" && !subDisabled ? "border-primary bg-primary/5" : "border-border",
              !subDisabled && "hover:bg-muted/50"
            )}
          >
            <RadioGroupItem value="subscription" id="method-subscription" disabled={subDisabled} />
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <RefreshCw className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Bill to subscription</p>
              {subDisabled ? (
                <p className="text-xs text-destructive">Not enough credits remaining</p>
              ) : (
                <p className="text-xs text-muted-foreground">Deduct from customer&apos;s active plan</p>
              )}
            </div>
          </label>
        )}
      </RadioGroup>
    </section>
  )
}
