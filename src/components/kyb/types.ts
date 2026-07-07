import type { KybFormData } from "@/lib/mock/store"

export interface CombinedFormData extends KybFormData {
  businessName: string
  ownerName: string
}

export interface KybErrors {
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

export interface StepProps {
  formData: CombinedFormData
  onChange: (field: keyof KybFormData, value: string) => void
  errors: KybErrors
  clearError: (field: keyof KybErrors) => void
}
