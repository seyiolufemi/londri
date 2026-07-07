import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import UploadZone from "@/components/shared/UploadZone"
import type { StepProps } from "../types"
import Asterisk from "../Asterisk"
import FieldError from "../FieldError"

interface Step2Props extends StepProps {
  onIdDocumentChange: (file: File | null) => void
}

export default function Step2OwnerIdentity({ formData, onChange, errors, clearError, onIdDocumentChange }: Step2Props) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
        Verify your identity
      </h2>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Your details are encrypted and stored securely.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="owner-name">Owner full name</Label>
          <Input id="owner-name" value={formData.ownerName} disabled readOnly />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bvn">BVN<Asterisk /></Label>
          <Input
            id="bvn"
            placeholder="12345678901"
            maxLength={11}
            value={formData.bvn}
            onChange={(e) => { onChange("bvn", e.target.value); clearError("bvn") }}
          />
          <FieldError message={errors.bvn} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nin">ID number<Asterisk /></Label>
          <Input
            id="nin"
            placeholder="98765432101"
            maxLength={11}
            value={formData.nin}
            onChange={(e) => { onChange("nin", e.target.value); clearError("nin") }}
          />
          <FieldError message={errors.nin} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="id-type">ID type<Asterisk /></Label>
          <Select
            value={formData.idType}
            onValueChange={(v) => { onChange("idType", v); clearError("idType") }}
          >
            <SelectTrigger id="id-type" className="w-full">
              <SelectValue placeholder="Select an ID type" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="national_id">NIN Slip</SelectItem>
              <SelectItem value="international_passport">International Passport</SelectItem>
              <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
              <SelectItem value="voters_card">Voter&apos;s Card</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.idType} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>ID document<Asterisk /></Label>
          <UploadZone
            label="Upload your ID document"
            hint="JPG, PNG or PDF — max 5MB"
            accept=".jpg,.jpeg,.png,.pdf"
            required
            onFileChange={(file) => { onIdDocumentChange(file); if (file) clearError("idDocument") }}
          />
          <FieldError message={errors.idDocument} />
        </div>
      </div>
    </div>
  )
}
