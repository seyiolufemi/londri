"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedPanel from "@/components/auth/AnimatedPanel"
import { useStore, type KybFormData } from "@/lib/mock/store"
import {
  useGetBanksQuery,
  useLazyLookupBankAccountQuery,
  useSaveBankAccountMutation,
} from "@/redux/api/accountsApi"
import { useGetMyBusinessQuery, useRegisterBusinessMutation } from "@/redux/api/businessApi"
import { useSubmitKycMutation, useSubmitKybMutation } from "@/redux/api/complianceApi"
import { useUploadFileMutation } from "@/redux/api/uploadApi"
import { getApiErrorMessage } from "@/lib/apiError"
import StepIndicator from "@/components/kyb/StepIndicator"
import Step1BusinessInfo from "@/components/kyb/steps/Step1BusinessInfo"
import Step2OwnerIdentity from "@/components/kyb/steps/Step2OwnerIdentity"
import Step3BankAccount from "@/components/kyb/steps/Step3BankAccount"
import Step4Documents from "@/components/kyb/steps/Step4Documents"
import type { CombinedFormData, KybErrors } from "@/components/kyb/types"

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
  const [premisesPhotos, setPremisesPhotos] = useState<File[]>([])
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
  const [submitKyb, { isLoading: isSubmittingKyb }] = useSubmitKybMutation()
  // registerBusiness (step 1) invalidates the "Business" tag, so this refetches
  // and has the real business id by the time step 4 needs it.
  const { data: business } = useGetMyBusinessQuery()

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
      if (!formData.cacNumber.trim()) next.cacNumber = "CAC registration number is required"
      if (!proofOfAddressFile) next.proofOfAddress = "Please upload your proof of address"
    }

    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (kybStep === 1) {
      try {
        await registerBusiness({
          name: formData.businessName,
          cac_registration_number: "",
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
    } else if (kybStep === 4) {
      if (!proofOfAddressFile) return
      if (!business?.id) {
        toast.error("Couldn't find your business — please go back and try again")
        return
      }

      try {
        const { url: proofUrl } = await uploadFile(proofOfAddressFile).unwrap()
        const photoUrls: string[] = []
        for (const photo of premisesPhotos) {
          const { url } = await uploadFile(photo).unwrap()
          photoUrls.push(url)
        }
        await submitKyb({
          businessId: business.id,
          body: {
            cac_registration_number: formData.cacNumber,
            proof_of_address: proofUrl,
            business_premises_photos: photoUrls,
          },
        }).unwrap()
      } catch (error) {
        toast.error(getApiErrorMessage((error as { data?: unknown }).data, "Couldn't submit for review"))
        return
      }
    }

    if (kybStep < 4) {
      setKybStep((kybStep + 1) as 2 | 3 | 4) // safe: kybStep < 4 checked above
    } else {
      router.push("/kyb-status")
    }
  }

  const isSubmitting =
    isRegisteringBusiness || isUploadingDocument || isSubmittingKyc || isSavingBank || isSubmittingKyb

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-1/2 overflow-y-auto bg-background">
        <div className="px-12 py-12">
          <Image src="/logo+wordmark-teal.png" alt="Londri" width={236} height={73} className="h-7 w-auto" />

          <StepIndicator currentStep={kybStep} />

          <div className="mt-10">
            {kybStep === 1 && (
              <Step1BusinessInfo formData={formData} onChange={onChange} errors={errors} clearError={clearError} />
            )}
            {kybStep === 2 && (
              <Step2OwnerIdentity
                formData={formData}
                onChange={onChange}
                errors={errors}
                clearError={clearError}
                onIdDocumentChange={setIdDocumentFile}
              />
            )}
            {kybStep === 3 && (
              <Step3BankAccount
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
              <Step4Documents
                formData={formData}
                onChange={onChange}
                errors={errors}
                clearError={clearError}
                onProofOfAddressChange={setProofOfAddressFile}
                premisesPhotos={premisesPhotos}
                onPremisesPhotosChange={setPremisesPhotos}
              />
            )}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button variant="default" onClick={handleContinue} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {kybStep === 4 ? "Submit for review" : "Continue"}
            </Button>
          </div>
        </div>
      </div>

      <AnimatedPanel />
    </div>
  )
}
