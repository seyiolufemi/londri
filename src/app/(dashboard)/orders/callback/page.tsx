"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useGetOrderQuery } from "@/redux/api/ordersApi"
import { Button } from "@/components/ui/button"
import { formatNaira } from "@/components/orders/constants"

const POLL_INTERVAL_MS = 3000
const MAX_POLL_ATTEMPTS = 10

export default function OrderCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const { data: order, isLoading, isError, refetch } = useGetOrderQuery(orderId ?? "", {
    skip: !orderId,
  })

  const [pollAttempt, setPollAttempt] = useState(0)

  // Payment status may still be "pending" right after returning from checkout —
  // poll a few times for the webhook to catch up, rather than trusting the
  // redirect alone (the gateway sends the owner back here on failure too).
  useEffect(() => {
    if (!order || order.payment_status !== "pending" || pollAttempt >= MAX_POLL_ATTEMPTS) return
    const timer = setTimeout(() => {
      setPollAttempt((n) => n + 1)
      refetch()
    }, POLL_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [order, pollAttempt, refetch])

  function goToDashboard() {
    router.push(orderId ? `/orders?orderId=${orderId}` : "/orders")
  }

  function handleCheckAgain() {
    setPollAttempt(0)
    refetch()
  }

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle className="size-10 text-muted-foreground" />
        <p className="mt-4 text-base font-medium text-foreground">Invalid payment link</p>
        <p className="mt-1 text-sm text-muted-foreground">We couldn&apos;t find an order to confirm.</p>
        <Button className="mt-6" onClick={goToDashboard}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  if (isLoading || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
        <p className="mt-4 text-base font-medium text-foreground">Checking your payment status…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle className="size-10 text-destructive" />
        <p className="mt-4 text-base font-medium text-foreground">Couldn&apos;t load this order</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please try again, or head back to your dashboard.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
          <Button onClick={goToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (order.payment_status === "paid") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <h1 className="mt-4 font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
          Payment Successful
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.reference_id} — {formatNaira(order.amount)}
        </p>
        <Button className="mt-6" onClick={goToDashboard}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  if (order.payment_status === "pending") {
    const stillPolling = pollAttempt < MAX_POLL_ATTEMPTS
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
        <h1 className="mt-4 text-base font-medium text-foreground">
          {stillPolling ? "Confirming your payment…" : "Still confirming your payment"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stillPolling
            ? "This usually only takes a few seconds."
            : "This is taking longer than expected — you can check again or come back later."}
        </p>
        <div className="mt-6 flex gap-3">
          {!stillPolling && (
            <Button variant="outline" onClick={handleCheckAgain}>
              Check Again
            </Button>
          )}
          <Button onClick={goToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  // "refunded" or any other unexpected status
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <XCircle className="size-10 text-muted-foreground" />
      <h1 className="mt-4 text-base font-medium text-foreground">Payment not completed</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.reference_id} — status: {order.payment_status}
      </p>
      <Button className="mt-6" onClick={goToDashboard}>
        Back to Dashboard
      </Button>
    </div>
  )
}
