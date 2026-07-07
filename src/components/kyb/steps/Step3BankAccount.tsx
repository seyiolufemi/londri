import { CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Bank } from "@/redux/api/accountsApi"
import type { StepProps } from "../types"
import Asterisk from "../Asterisk"
import FieldError from "../FieldError"

interface Step3Props extends StepProps {
  banks: Bank[]
  banksLoading: boolean
  accountVerifying: boolean
  accountVerified: boolean
  onBankChange: (bankCode: string) => void
  onAccountNumberChange: (value: string) => void
}

export default function Step3BankAccount({
  formData,
  errors,
  clearError,
  banks,
  banksLoading,
  accountVerifying,
  accountVerified,
  onBankChange,
  onAccountNumberChange,
}: Step3Props) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
        Where should we send your payouts?
      </h2>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Payments collected from customers will be transferred here.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bank-name">Bank name<Asterisk /></Label>
          <Select
            value={formData.bankCode}
            onValueChange={(v) => { onBankChange(v); clearError("bankName") }}
            disabled={banksLoading}
          >
            <SelectTrigger id="bank-name" className="w-full">
              <SelectValue placeholder={banksLoading ? "Loading banks…" : "Select a bank"} />
            </SelectTrigger>
            <SelectContent position="popper">
              {banks.map((b) => (
                <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.bankName} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-number">Account number<Asterisk /></Label>
          <Input
            id="account-number"
            placeholder="0123456789"
            maxLength={10}
            value={formData.accountNumber}
            onChange={(e) => onAccountNumberChange(e.target.value)}
          />
          <FieldError message={errors.accountNumber} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-name">Account name<Asterisk /></Label>
          <div className="relative">
            <Input
              id="account-name"
              value={formData.accountName}
              placeholder={accountVerifying ? "Verifying..." : "Enter account number to verify"}
              disabled
            />
            {accountVerified && (
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                <CheckCircle2 className="size-4 text-green-600" />
              </div>
            )}
          </div>
          <FieldError message={errors.accountName} />
        </div>
      </div>
    </div>
  )
}
