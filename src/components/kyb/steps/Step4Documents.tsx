import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UploadZone from "@/components/shared/UploadZone"
import type { StepProps } from "../types"
import Asterisk from "../Asterisk"
import FieldError from "../FieldError"
import ReviewRow from "../ReviewRow"
import PremisesPhotosUpload from "../PremisesPhotosUpload"

interface Step4Props extends StepProps {
  onProofOfAddressChange: (file: File | null) => void
  premisesPhotos: File[]
  onPremisesPhotosChange: (photos: File[]) => void
}

export default function Step4Documents({
  formData,
  onChange,
  errors,
  clearError,
  onProofOfAddressChange,
  premisesPhotos,
  onPremisesPhotosChange,
}: Step4Props) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-foreground">
        Almost done — upload your documents
      </h2>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Accepted formats: JPG, PNG, PDF. Max 5MB per file.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cac-number">CAC registration number<Asterisk /></Label>
          <Input
            id="cac-number"
            placeholder="RC-1234567"
            value={formData.cacNumber}
            onChange={(e) => { onChange("cacNumber", e.target.value); clearError("cacNumber") }}
          />
          <FieldError message={errors.cacNumber} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Proof of address<Asterisk /></Label>
          <UploadZone
            label="Proof of Address"
            hint="Utility bill or bank statement, not older than 3 months"
            accept=".jpg,.jpeg,.png,.pdf"
            required
            onFileChange={(file) => { onProofOfAddressChange(file); if (file) clearError("proofOfAddress") }}
          />
          <FieldError message={errors.proofOfAddress} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Business premises photos</Label>
          <PremisesPhotosUpload photos={premisesPhotos} onPhotosChange={onPremisesPhotosChange} />
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="divide-y divide-border">
            <ReviewRow label="Business name" value={formData.businessName} />
            <ReviewRow label="CAC number" value={formData.cacNumber} />
            <ReviewRow label="Bank" value={formData.bankName} />
            <ReviewRow label="Account name" value={formData.accountName} />
          </div>
        </div>
      </div>
    </div>
  )
}
