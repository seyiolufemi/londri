import type { SubscriptionPlan, CustomerSubscription } from "@/types"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import StatusBadge from "./StatusBadge"
import UsageBar from "./UsageBar"

interface SubscriberSheetProps {
  subscriber: CustomerSubscription | null
  plan: SubscriptionPlan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SubscriberSheet({ subscriber, plan, open, onOpenChange }: SubscriberSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        {subscriber && plan && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-foreground">
                {subscriber.customerName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {subscriber.customerPhone}
              </p>
            </div>

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
