import { Link as LinkIcon, MessageCircle, RefreshCw } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { OrderChannel } from "@/redux/api/ordersApi"
import type { CustomerSubscription } from "@/types"

interface PaymentMethodSectionProps {
  value: OrderChannel
  onChange: (v: OrderChannel) => void
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
        onValueChange={(v) => onChange(v as OrderChannel)}
        className="flex flex-col gap-3"
      >
        {/* Walk-in customer — message them the payment link on WhatsApp */}
        <label
          htmlFor="method-walk-in"
          className={cn(
            "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
            value === "walk_in" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          )}
        >
          <RadioGroupItem value="walk_in" id="method-walk-in" />
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <MessageCircle className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Walk-in Customer</p>
            <p className="text-xs text-muted-foreground">
              Customer is at your shop — you&apos;ll message them the payment link on WhatsApp
            </p>
          </div>
        </label>

        {/* Online booking — customer isn't at the shop, route them the payment link */}
        <label
          htmlFor="method-online-booking"
          className={cn(
            "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
            value === "online_booking" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          )}
        >
          <RadioGroupItem value="online_booking" id="method-online-booking" />
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <LinkIcon className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Online Booking</p>
            <p className="text-xs text-muted-foreground">
              Customer isn&apos;t at your shop — send them the payment link
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
              value === "subscription_fulfillment" && !subDisabled ? "border-primary bg-primary/5" : "border-border",
              !subDisabled && "hover:bg-muted/50"
            )}
          >
            <RadioGroupItem value="subscription_fulfillment" id="method-subscription" disabled={subDisabled} />
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
