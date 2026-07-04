import { Package } from "lucide-react"
import type { SubscriptionPlan } from "@/redux/api/catalogApi"
import { Skeleton } from "@/components/ui/skeleton"
import PlanCard from "./PlanCard"

interface PlansSectionProps {
  loading: boolean
  plans: SubscriptionPlan[]
  categoryNameById: Record<string, string>
  activeSubsByPlan: Record<string, number>
  deactivatingId: string | null
  onEdit: (plan: SubscriptionPlan) => void
  onRequestDeactivate: (plan: SubscriptionPlan) => void
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-9 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-3 h-4 w-full" />
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  )
}

export default function PlansSection({
  loading,
  plans,
  categoryNameById,
  activeSubsByPlan,
  deactivatingId,
  onEdit,
  onRequestDeactivate,
}: PlansSectionProps) {
  if (loading) {
    return (
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PlanCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="mb-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
        <Package className="size-7 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No plans yet. Add your first subscription plan.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          categoryNameById={categoryNameById}
          activeSubscriberCount={activeSubsByPlan[plan.id] ?? 0}
          isDeactivating={deactivatingId === plan.id}
          onEdit={() => onEdit(plan)}
          onRequestDeactivate={() => onRequestDeactivate(plan)}
        />
      ))}
    </div>
  )
}
