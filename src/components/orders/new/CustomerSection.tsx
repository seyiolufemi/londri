import { BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CustomerSubscription } from "@/types"

interface CustomerSectionProps {
  name: string
  phone: string
  email: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onEmailChange: (v: string) => void
  nameError?: string
  phoneError?: string
  emailError?: string
  detectedSub: CustomerSubscription | null
  remainingCredits: number
  showSubTrigger: boolean
  onStartSubscriptionClick: () => void
}

export default function CustomerSection({
  name,
  phone,
  email,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  nameError,
  phoneError,
  emailError,
  detectedSub,
  remainingCredits,
  showSubTrigger,
  onStartSubscriptionClick,
}: CustomerSectionProps) {
  return (
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
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={cn(nameError && "border-destructive")}
          />
          {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
        </div>

        {/* WhatsApp number */}
        <div>
          <Label htmlFor="customer-phone" className="mb-1.5 block text-sm">
            WhatsApp number
          </Label>
          <Input
            id="customer-phone"
            placeholder="+234 801 234 5678"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={cn(phoneError && "border-destructive")}
          />
          {phoneError && <p className="mt-1 text-xs text-destructive">{phoneError}</p>}

          {/* Active subscription card */}
          {detectedSub && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-2.5">
                <BadgeCheck className="mt-0.5 size-[18px] shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{detectedSub.planName} Plan</p>
                  <p className="text-xs text-muted-foreground">
                    {remainingCredits} of {detectedSub.creditsTotal} items remaining this cycle
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Active
              </span>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="customer-email" className="mb-1.5 block text-sm">
            Email
          </Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="customer@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={cn(emailError && "border-destructive")}
          />
          {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
        </div>

        {/* Start subscription trigger — visible when phone entered but no active sub found */}
        {showSubTrigger && (
          <button
            type="button"
            onClick={onStartSubscriptionClick}
            className="mt-1 self-start text-sm text-primary hover:underline"
          >
            Not a subscriber? Start a subscription for this customer &rarr;
          </button>
        )}
      </div>
    </section>
  )
}
