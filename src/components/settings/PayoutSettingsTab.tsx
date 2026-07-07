"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useGetMeQuery } from "@/redux/api/authApi"
import {
  useGetBanksQuery,
  useLazyLookupBankAccountQuery,
  useSaveBankAccountMutation,
} from "@/redux/api/accountsApi"
import { apiError } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PayoutSettingsTab() {
  const { data: me, isLoading: meLoading } = useGetMeQuery()
  const { data: banks } = useGetBanksQuery()
  const [lookupBankAccount, { data: lookupResult, isFetching: isLookingUp, isError: lookupFailed }] =
    useLazyLookupBankAccountQuery()
  const [saveBankAccount, { isLoading: isSaving }] = useSaveBankAccountMutation()

  const bankAccounts = me?.bank_accounts ?? []
  const bankNameByCode = Object.fromEntries((banks ?? []).map((b) => [b.code, b.name]))

  const [bankCode, setBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  // Trigger a real lookup once both a bank and a full 10-digit account number
  // are entered, adjusted during render rather than in an effect (see
  // react-hooks/set-state-in-effect).
  const lookupKey = `${bankCode}:${accountNumber}`
  const [lastLookupKey, setLastLookupKey] = useState("")
  if (bankCode && accountNumber.length === 10 && lookupKey !== lastLookupKey) {
    setLastLookupKey(lookupKey)
    lookupBankAccount({ bank_code: bankCode, account_number: accountNumber })
  }

  const verifiedName = lookupResult?.account_name ?? ""

  async function handleAddAccount() {
    if (!bankCode || accountNumber.length !== 10 || !verifiedName) return
    try {
      await saveBankAccount({ bank_code: bankCode, account_number: accountNumber }).unwrap()
      toast.success("Bank account added")
      setBankCode("")
      setAccountNumber("")
      setLastLookupKey("")
    } catch (error) {
      toast.error(apiError(error, "Couldn't add bank account"))
    }
  }

  return (
    <div className="max-w-md">
      <p className="mb-6 text-sm text-muted-foreground">
        This is where your earnings are transferred.
      </p>

      {/* Existing accounts */}
      {meLoading ? (
        <div className="mb-6 space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : (
        bankAccounts.length > 0 && (
          <div className="mb-6 space-y-3">
            {bankAccounts.map((acct) => (
              <div key={acct.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {bankNameByCode[acct.bank_code] ?? acct.bank_code}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {acct.is_default && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Default
                      </span>
                    )}
                    {acct.is_verified && <CheckCircle2 className="size-4 text-green-600" />}
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  ••••{acct.account_number.slice(-4)} · {acct.account_name}
                </p>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add new account */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Add a bank account</h3>

        <div>
          <Label htmlFor="bank-name" className="mb-1.5 block text-sm">
            Bank name
          </Label>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger id="bank-name" className="w-full">
              <SelectValue placeholder="Select a bank" />
            </SelectTrigger>
            <SelectContent>
              {(banks ?? []).map((b) => (
                <SelectItem key={b.code} value={b.code}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="acct-number" className="mb-1.5 block text-sm">
            Account number
          </Label>
          <Input
            id="acct-number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            maxLength={10}
            placeholder="0123456789"
            className="font-mono"
          />
        </div>

        <div>
          <Label htmlFor="acct-name" className="mb-1.5 block text-sm">
            Account name
          </Label>
          <div className="relative">
            <Input
              id="acct-name"
              value={isLookingUp ? "" : verifiedName}
              disabled
              placeholder={
                isLookingUp
                  ? "Verifying..."
                  : lookupFailed
                    ? "Couldn't verify this account"
                    : "Enter bank and account number"
              }
              className="pr-9"
            />
            {isLookingUp && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {verifiedName && !isLookingUp && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="size-4 text-green-600" />
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleAddAccount} disabled={!verifiedName || isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Add Account
        </Button>
      </div>
    </div>
  )
}
