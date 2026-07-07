import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NIGERIAN_STATES } from "../constants"
import type { StepProps } from "../types"
import Asterisk from "../Asterisk"
import FieldError from "../FieldError"

export default function Step1BusinessInfo({ formData, onChange, errors, clearError }: StepProps) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
        Tell us about your business
      </h2>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        We&apos;ll use this to verify your business registration.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="business-name">Business name</Label>
          <Input id="business-name" value={formData.businessName} disabled readOnly />
          <p className="text-xs text-muted-foreground">Carried over from signup</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="business-address">Business address<Asterisk /></Label>
          <Input
            id="business-address"
            placeholder="12 Adeola Odeku Street"
            value={formData.businessAddress}
            onChange={(e) => { onChange("businessAddress", e.target.value); clearError("businessAddress") }}
          />
          <FieldError message={errors.businessAddress} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State<Asterisk /></Label>
          <Select
            value={formData.state}
            onValueChange={(v) => { onChange("state", v); clearError("state") }}
          >
            <SelectTrigger id="state" className="w-full">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent position="popper">
              {NIGERIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.state} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City<Asterisk /></Label>
          <Input
            id="city"
            placeholder="Victoria Island"
            value={formData.city}
            onChange={(e) => { onChange("city", e.target.value); clearError("city") }}
          />
          <FieldError message={errors.city} />
        </div>
      </div>
    </div>
  )
}
