import { Pencil, Package, Tag, Users, Loader2 } from "lucide-react"
import type { SubscriptionPlan } from "@/redux/api/catalogApi"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { BILLING_LABELS, formatNaira } from "./constants"

interface PlanCardProps {
  plan: SubscriptionPlan
  categoryNameById: Record<string, string>
  activeSubscriberCount: number
  isDeactivating: boolean
  onEdit: () => void
  onRequestDeactivate: () => void
}

export default function PlanCard({
  plan,
  categoryNameById,
  activeSubscriberCount,
  isDeactivating,
  onEdit,
  onRequestDeactivate,
}: PlanCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">{plan.name}</span>
        {isDeactivating ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            checked={plan.is_active}
            disabled={!plan.is_active}
            onCheckedChange={() => plan.is_active && onRequestDeactivate()}
            aria-label={`Toggle ${plan.name} plan`}
          />
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
          {formatNaira(plan.price)}
        </span>
        <span className="text-sm text-muted-foreground">
          {BILLING_LABELS[plan.billing_cycle] ?? "/month"}
        </span>
      </div>

      {plan.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {plan.description}
        </p>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-2 flex items-center gap-2">
          <Package className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {plan.item_cap} items per cycle
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {plan.eligible_category_ids.map((id) => (
              <span
                key={id}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {categoryNameById[id] ?? id}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Users className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {activeSubscriberCount} active subscriber{activeSubscriberCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="mr-1.5 size-3.5" />
          Edit
        </Button>
      </div>
    </div>
  )
}
