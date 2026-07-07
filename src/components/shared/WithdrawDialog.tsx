"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useStore } from "@/lib/mock/store"
import { useListTransactionsQuery } from "@/redux/api/transactionsApi"
import type { Payout } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Phase = "form" | "loading" | "success"

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

interface Committed {
  amount: number
  bankName: string
  last4: string
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG")
}

export default function WithdrawDialog({ open, onOpenChange }: WithdrawDialogProps) {
  // Real balance — same query/cache the Overview and Transactions pages already use.
  const { data: transactionsData, isLoading: balanceLoading } = useListTransactionsQuery(
    { limit: 1 },
    { skip: !open }
  )
  const availableBalance = transactionsData?.available_balance ?? 0

  // Bank account details have no real GET endpoint yet (only lookup/save) — still mock.
  const businessBankName = useStore((s) => s.businessBankName)
  const businessAccountNumber = useStore((s) => s.businessAccountNumber)
  const businessAccountName = useStore((s) => s.businessAccountName)
  const addPayout = useStore((s) => s.addPayout)
  const updatePayoutStatus = useStore((s) => s.updatePayoutStatus)
  const addToTotalPaidOut = useStore((s) => s.addToTotalPaidOut)

  const [phase, setPhase] = useState<Phase>("form")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [committed, setCommitted] = useState<Committed | null>(null)
  const [hasPrefilled, setHasPrefilled] = useState(false)

  const last4 = businessAccountNumber.slice(-4)

  // Reset the form each time the dialog transitions from closed to open, rather
  // than in an effect (see react-hooks/set-state-in-effect).
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPhase("form")
      setAmount("")
      setError("")
      setCommitted(null)
      setHasPrefilled(false)
    }
  }

  // Prefill the amount once the real balance has loaded during this open session.
  if (open && !balanceLoading && !hasPrefilled) {
    setHasPrefilled(true)
    setAmount(String(availableBalance))
  }

  const amountNum = parseFloat(amount) || 0

  function validate(): boolean {
    if (amountNum <= 0) {
      setError("Enter an amount to withdraw")
      return false
    }
    if (amountNum < 1000) {
      setError("Minimum withdrawal is ₦1,000")
      return false
    }
    if (amountNum > availableBalance) {
      setError(`Amount exceeds available balance of ${formatNaira(availableBalance)}`)
      return false
    }
    setError("")
    return true
  }

  function handleConfirm() {
    if (!validate()) return

    const id = `payout_${Date.now()}`
    const randomRef = Math.floor(100000 + Math.random() * 900000).toString()
    const bankReference = `NMB-${randomRef}`
    const now = new Date()
    const period = now.toLocaleString("en-NG", { month: "long", year: "numeric" })

    const payout: Payout = {
      id,
      businessId: "biz_001",
      amount: amountNum,
      status: "processing",
      bankReference,
      period,
      createdAt: now.toISOString(),
    }

    addPayout(payout)
    setCommitted({ amount: amountNum, bankName: businessBankName, last4 })
    setPhase("loading")

    setTimeout(() => {
      updatePayoutStatus(id, "completed")
      addToTotalPaidOut(amountNum)
      setPhase("success")
    }, 2000)
  }

  function handleOpenChange(v: boolean) {
    if (!v && phase === "loading") {
      toast.info("Withdrawal is still processing — we'll update your balance shortly.")
      setPhase("form")
      setCommitted(null)
      onOpenChange(false)
      return
    }
    onOpenChange(v)
  }

  const buttonLabel =
    amountNum > 0
      ? `Withdraw ${formatNaira(amountNum)} to ${businessBankName} ••••${last4}`
      : "Withdraw to Account"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("max-w-sm", phase === "loading" && "[&>button]:hidden")}
        onInteractOutside={(e) => { if (phase === "loading") e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (phase === "loading") e.preventDefault() }}
      >
        {phase === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Withdraw Balance</DialogTitle>
              <DialogDescription>
                Funds will be sent to your registered bank account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                {balanceLoading ? (
                  <Skeleton className="mt-1 h-8 w-28" />
                ) : (
                  <p className="font-[family-name:var(--font-jakarta)] text-2xl font-bold tabular-nums text-foreground">
                    {formatNaira(availableBalance)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="withdraw-amount">Amount to withdraw</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="0"
                  step="100"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setError("")
                  }}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <div className="rounded-lg bg-muted/30 p-4 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{businessBankName}</p>
                <p className="text-sm text-muted-foreground">
                  ••••{last4} · {businessAccountName}
                </p>
              </div>

              <Button className="w-full" onClick={handleConfirm} disabled={balanceLoading}>
                {buttonLabel}
              </Button>
            </div>
          </>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="size-32 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing withdrawal...</p>
          </div>
        )}

        {phase === "success" && committed && (
          <>
            <DialogHeader>
              <DialogTitle>Withdrawal Successful</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 className="size-32 text-primary" />
              <div className="text-center">
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {formatNaira(committed.amount)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {committed.bankName} ••••{committed.last4}
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
