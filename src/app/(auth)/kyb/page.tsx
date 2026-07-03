"use client"

import { Fragment, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import AnimatedPanel from "@/components/auth/AnimatedPanel"
import { useStore, type KybFormData } from "@/lib/mock/store"
import { cn } from "@/lib/utils"
import {
  useGetBanksQuery,
  useLazyLookupBankAccountQuery,
  useSaveBankAccountMutation,
  type Bank,
} from "@/redux/api/accountsApi"
import { useRegisterBusinessMutation } from "@/redux/api/businessApi"
import { useSubmitKycMutation } from "@/redux/api/complianceApi"
import { useUploadFileMutation } from "@/redux/api/uploadApi"
import { getApiErrorMessage } from "@/lib/apiError"

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const STEPS = [
  { label: "Business Info" },
  { label: "Owner Identity" },
  { label: "Bank Account" },
  { label: "Documents" },
]

interface CombinedFormData extends KybFormData {
  businessName: string
  ownerName: string
}

interface KybErrors {
  cacNumber?: string
  businessAddress?: string
  state?: string
  city?: string
  bvn?: string
  nin?: string
  idType?: string
  idDocument?: string
  bankName?: string
  accountNumber?: string
  accountName?: string
  proofOfAddress?: string
}

interface StepProps {
  formData: CombinedFormData
  onChange: (field: keyof KybFormData, value: string) => void
  errors: KybErrors
  clearError: (field: keyof KybErrors) => void
}

const Asterisk = () => <span className="text-destructive"> *</span>

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value || "—"}</span>
    </div>
  )
}

function Step1({ formData, onChange, errors, clearError }: StepProps) {
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

interface Step2Props extends StepProps {
  onIdDocumentChange: (file: File | null) => void
}

function Step2({ formData, onChange, errors, clearError, onIdDocumentChange }: Step2Props) {
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
              <SelectItem value="nin-slip">NIN Slip</SelectItem>
              <SelectItem value="passport">International Passport</SelectItem>
              <SelectItem value="drivers-license">Driver&apos;s License</SelectItem>
              <SelectItem value="voters-card">Voter&apos;s Card</SelectItem>
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

interface Step3Props extends StepProps {
  banks: Bank[]
  banksLoading: boolean
  accountVerifying: boolean
  accountVerified: boolean
  onBankChange: (bankCode: string) => void
  onAccountNumberChange: (value: string) => void
}

function Step3({
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

interface Step4Props {
  formData: CombinedFormData
  errors: KybErrors
  clearError: (field: keyof KybErrors) => void
  onProofOfAddressChange: (file: File | null) => void
}

function Step4({ formData, errors, clearError, onProofOfAddressChange }: Step4Props) {
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
          <Label>Business premise photo</Label>
          <UploadZone
            label="Business Premise Photo"
            hint="Optional — helps customers recognize your location"
            accept=".jpg,.jpeg,.png"
          />
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

export default function Page() {
  const router = useRouter()

  const signupData = useStore((s) => s.signupData)
  const kybData = useStore((s) => s.kybData)
  const kybStep = useStore((s) => s.kybStep)
  const setSignupStep = useStore((s) => s.setSignupStep)
  const setKybData = useStore((s) => s.setKybData)
  const setKybStep = useStore((s) => s.setKybStep)

  const [errors, setErrors] = useState<KybErrors>({})
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null)
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null)
  const [accountVerifying, setAccountVerifying] = useState(false)
  const [accountVerified, setAccountVerified] = useState(
    kybData.accountNumber.length === 10 && kybData.accountName.length > 0
  )

  const formData: CombinedFormData = {
    businessName: signupData.businessName || "Sparkle Wash Laundry",
    ownerName: signupData.ownerName || "Amara Okonkwo",
    ...kybData,
  }

  const clearError = (field: keyof KybErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }))

  const onChange = (field: keyof KybFormData, value: string) => {
    setKybData({ [field]: value })
    clearError(field as keyof KybErrors)
  }

  const { data: banks = [], isLoading: banksLoading } = useGetBanksQuery()
  const [lookupBankAccount] = useLazyLookupBankAccountQuery()
  const [saveBankAccount, { isLoading: isSavingBank }] = useSaveBankAccountMutation()
  const [registerBusiness, { isLoading: isRegisteringBusiness }] = useRegisterBusinessMutation()
  const [uploadFile, { isLoading: isUploadingDocument }] = useUploadFileMutation()
  const [submitKyc, { isLoading: isSubmittingKyc }] = useSubmitKycMutation()

  const verifyAccount = async (accountNumber: string, bankCode: string) => {
    setAccountVerifying(true)
    setAccountVerified(false)
    try {
      const result = await lookupBankAccount({ account_number: accountNumber, bank_code: bankCode }).unwrap()
      setKybData({ accountName: result.account_name })
      setAccountVerified(true)
    } catch (error) {
      setKybData({ accountName: "" })
      toast.error(getApiErrorMessage((error as { data?: unknown }).data, "Couldn't verify that account number"))
    } finally {
      setAccountVerifying(false)
    }
  }

  const handleAccountNumberChange = (value: string) => {
    onChange("accountNumber", value)
    clearError("accountNumber")
    setKybData({ accountName: "" })
    setAccountVerified(false)

    if (value.length === 10 && formData.bankCode) {
      verifyAccount(value, formData.bankCode)
    } else {
      setAccountVerifying(false)
    }
  }

  const handleBankChange = (bankCode: string) => {
    const bank = banks.find((b) => b.code === bankCode)
    setKybData({ bankCode, bankName: bank?.name ?? "" })
    clearError("bankName")

    if (formData.accountNumber.length === 10) {
      verifyAccount(formData.accountNumber, bankCode)
    }
  }

  const handleBack = () => {
    setErrors({})
    if (kybStep > 1) {
      setKybStep((kybStep - 1) as 1 | 2 | 3 | 4) // safe: kybStep > 1 checked above
    } else {
      setSignupStep(2)
      router.push("/signup")
    }
  }

  const handleContinue = async () => {
    const next: KybErrors = {}

    if (kybStep === 1) {
      if (!formData.cacNumber.trim()) next.cacNumber = "CAC registration number is required"
      if (!formData.businessAddress.trim()) next.businessAddress = "Business address is required"
      if (!formData.state) next.state = "Please select a state"
      if (!formData.city.trim()) next.city = "City is required"
    } else if (kybStep === 2) {
      const bvnDigits = formData.bvn.replace(/\D/g, "")
      if (!formData.bvn.trim()) {
        next.bvn = "BVN is required"
      } else if (bvnDigits.length !== 11) {
        next.bvn = "BVN must be exactly 11 digits"
      }
      const ninDigits = formData.nin.replace(/\D/g, "")
      if (!formData.nin.trim()) {
        next.nin = "ID number is required"
      } else if (ninDigits.length !== 11) {
        next.nin = "ID number must be exactly 11 digits"
      }
      if (!formData.idType) next.idType = "Please select an ID type"
      if (!idDocumentFile) next.idDocument = "Please upload your ID document"
    } else if (kybStep === 3) {
      if (!formData.bankCode) next.bankName = "Please select a bank"
      const accDigits = formData.accountNumber.replace(/\D/g, "")
      if (!formData.accountNumber) {
        next.accountNumber = "Account number is required"
      } else if (accDigits.length !== 10) {
        next.accountNumber = "Account number must be exactly 10 digits"
      }
      if (!accountVerified) {
        next.accountName = accountVerifying
          ? "Please wait for verification to complete"
          : "Enter a 10-digit account number to verify"
      }
    } else if (kybStep === 4) {
      if (!proofOfAddressFile) next.proofOfAddress = "Please upload your proof of address"
    }

    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (kybStep === 1) {
      try {
        await registerBusiness({
          name: formData.businessName,
          cac_registration_number: formData.cacNumber,
          address: formData.businessAddress,
          city: formData.city,
          state: formData.state,
        }).unwrap()
      } catch (error) {
        toast.error(getApiErrorMessage((error as { data?: unknown }).data, "Couldn't save business details"))
        return
      }
    } else if (kybStep === 2) {
      if (!idDocumentFile) return

      try {
        const { url } = await uploadFile(idDocumentFile).unwrap()
        await submitKyc({
          bvn: formData.bvn,
          id_type: formData.idType,
          id_number: formData.nin,
          id_document: url,
        }).unwrap()
      } catch (error) {
        toast.error(getApiErrorMessage((error as { data?: unknown }).data, "Couldn't submit KYC details"))
        return
      }
    } else if (kybStep === 3) {
      try {
        await saveBankAccount({
          account_number: formData.accountNumber,
          bank_code: formData.bankCode,
        }).unwrap()
      } catch (error) {
        toast.error(getApiErrorMessage((error as { data?: unknown }).data, "Couldn't save bank account"))
        return
      }
    }

    if (kybStep < 4) {
      setKybStep((kybStep + 1) as 2 | 3 | 4) // safe: kybStep < 4 checked above
    } else {
      router.push("/kyb-status")
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left column — scrollable */}
      <div className="w-1/2 overflow-y-auto bg-background">
        <div className="px-12 py-12">
          <Image src="/logo+wordmark-teal.png" alt="Londri" width={236} height={73} className="h-7 w-auto" />

          {/* Step indicator */}
          <div className="mt-8 flex items-start">
            {STEPS.map((step, i) => {
              const isCompleted = kybStep > i + 1
              const isActive = kybStep === i + 1
              return (
                <Fragment key={i}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                        isCompleted && "bg-primary/10 text-primary",
                        isActive && "bg-primary text-white",
                        !isCompleted && !isActive && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <Check className="size-3.5" /> : i + 1}
                    </div>
                    <span
                      className={cn(
                        "w-14 text-center text-xs font-medium leading-tight",
                        isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mt-3.5 h-px flex-1",
                        isCompleted ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>

          {/* Step content */}
          <div className="mt-10">
            {kybStep === 1 && (
              <Step1 formData={formData} onChange={onChange} errors={errors} clearError={clearError} />
            )}
            {kybStep === 2 && (
              <Step2
                formData={formData}
                onChange={onChange}
                errors={errors}
                clearError={clearError}
                onIdDocumentChange={setIdDocumentFile}
              />
            )}
            {kybStep === 3 && (
              <Step3
                formData={formData}
                onChange={onChange}
                errors={errors}
                clearError={clearError}
                banks={banks}
                banksLoading={banksLoading}
                accountVerifying={accountVerifying}
                accountVerified={accountVerified}
                onBankChange={handleBankChange}
                onAccountNumberChange={handleAccountNumberChange}
              />
            )}
            {kybStep === 4 && (
              <Step4
                formData={formData}
                errors={errors}
                clearError={clearError}
                onProofOfAddressChange={setProofOfAddressFile}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="default"
              onClick={handleContinue}
              disabled={isRegisteringBusiness || isUploadingDocument || isSubmittingKyc || isSavingBank}
            >
              {(isRegisteringBusiness || isUploadingDocument || isSubmittingKyc || isSavingBank) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {kybStep === 4 ? "Submit for review" : "Continue"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right column */}
      <AnimatedPanel />
    </div>
  )
}
