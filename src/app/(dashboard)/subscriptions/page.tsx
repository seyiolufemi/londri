"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/mock/store"
import { useGetMyBusinessQuery } from "@/redux/api/businessApi"
import {
  useGetCategoriesQuery,
  useGetPlansForBusinessQuery,
  useDeactivatePlanMutation,
  type SubscriptionPlan,
} from "@/redux/api/catalogApi"
import { apiError } from "@/lib/apiError"
import { cn } from "@/lib/utils"
import type { SubscriptionStatus } from "@/types"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import PlanDialog from "@/components/subscriptions/PlanDialog"
import PlansSection from "@/components/subscriptions/PlansSection"
import SubscribersTable from "@/components/subscriptions/SubscribersTable"
import SubscriberSheet from "@/components/subscriptions/SubscriberSheet"

export default function SubscriptionsPage() {
  const {
    data: business,
    isLoading: businessLoading,
    isFetching: businessFetching,
  } = useGetMyBusinessQuery()
  const isBusinessLoading = businessLoading || businessFetching
  const businessId = business?.id
  const locked = business?.current_kyb_status !== "verified"

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useGetCategoriesQuery(businessId ?? "", { skip: !businessId })
  const categories = useMemo(() => categoriesData ?? [], [categoriesData])
  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  const {
    data: plans = [],
    isLoading: plansLoading,
    isFetching: plansFetching,
  } = useGetPlansForBusinessQuery(businessId ?? "", { skip: !businessId })

  const isLoadingPlans =
    isBusinessLoading || plansLoading || plansFetching || categoriesLoading || categoriesFetching

  const [deactivatePlan] = useDeactivatePlanMutation()
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<SubscriptionPlan | null>(null)

  // Mock — no customer-subscription endpoint exists yet.
  const customerSubscriptions = useStore((s) => s.customerSubscriptions)

  const activeSubsByPlan = useMemo(() => {
    const counts: Record<string, number> = {}
    customerSubscriptions.forEach((s) => {
      if (s.status === "active") {
        counts[s.planId] = (counts[s.planId] ?? 0) + 1
      }
    })
    return counts
  }, [customerSubscriptions])

  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all")

  const filteredSubscribers = useMemo(() => {
    return customerSubscriptions.filter((s) => {
      if (planFilter !== "all" && s.planId !== planFilter) return false
      if (statusFilter !== "all" && s.status !== statusFilter) return false
      return true
    })
  }, [customerSubscriptions, planFilter, statusFilter])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  function openAddDialog() {
    if (locked) {
      toast.warning("Complete verification to manage plans.")
      return
    }
    setEditingPlan(null)
    setDialogOpen(true)
  }

  function openEditDialog(plan: SubscriptionPlan) {
    setEditingPlan(plan)
    setDialogOpen(true)
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget) return
    setDeactivatingId(deactivateTarget.id)
    try {
      await deactivatePlan(deactivateTarget.id).unwrap()
      toast.success("Plan deactivated")
      setDeactivateTarget(null)
    } catch (error) {
      toast.error(apiError(error, "Couldn't deactivate plan"))
    } finally {
      setDeactivatingId(null)
    }
  }

  const [viewSubscriberId, setViewSubscriberId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const viewingSubscriber = viewSubscriberId
    ? (customerSubscriptions.find((s) => s.id === viewSubscriberId) ?? null)
    : null
  const viewingPlan = viewingSubscriber
    ? (plans.find((p) => p.id === viewingSubscriber.planId) ?? null)
    : null

  function openSubscriberSheet(id: string) {
    setViewSubscriberId(id)
    setSheetOpen(true)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
            Subscriptions
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage subscription plans and view active subscribers
          </p>
        </div>
        <Button
          disabled={locked}
          className={cn(locked && "cursor-not-allowed opacity-50")}
          onClick={openAddDialog}
        >
          <Plus className="mr-1.5 size-4" />
          Add Plan
        </Button>
      </div>

      <h3 className="mb-4 text-base font-semibold text-foreground">Plans</h3>
      <PlansSection
        loading={isLoadingPlans}
        plans={plans}
        categoryNameById={categoryNameById}
        activeSubsByPlan={activeSubsByPlan}
        deactivatingId={deactivatingId}
        onEdit={openEditDialog}
        onRequestDeactivate={setDeactivateTarget}
      />

      <h3 className="mb-4 text-base font-semibold text-foreground">Subscribers</h3>
      <SubscribersTable
        plans={plans}
        subscribers={filteredSubscribers}
        planFilter={planFilter}
        onPlanFilterChange={setPlanFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onViewSubscriber={openSubscriberSheet}
      />

      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPlan={editingPlan}
        categories={categories}
      />

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate &ldquo;{deactivateTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This plan will no longer be available to new subscribers.
              Existing subscribers are not affected. This can&apos;t be undone
              from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeactivateConfirm}
            >
              Deactivate Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubscriberSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        subscriber={viewingSubscriber}
        plan={viewingPlan}
      />
    </div>
  )
}
