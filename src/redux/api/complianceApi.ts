import { apiManager } from "../apiManager"

export interface SubmitKycRequest {
  bvn: string
  id_type: string
  id_number: string
  id_document: string
}

export interface KycResponse {
  id: number
  user_id: string
  id_type: string
  id_number: string
  document_url: string
  status: string
  rejection_reason: string | null
  verified_at: string | null
  created_at: string
}

export interface SubmitKybRequest {
  cac_registration_number: string
  proof_of_address: string
  business_premises_photos: string[]
}

export interface KybResponse {
  id: number
  business_id: string
  cac_registration_number: string
  proof_of_address: string
  business_premises_photos: string[]
  status: string
  verified_at: string | null
  created_at: string
}

export const complianceApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    getKycStatus: builder.query<KycResponse, void>({
      query: () => "/compliance/kyc",
      providesTags: ["KYC"],
    }),
    submitKyc: builder.mutation<KycResponse, SubmitKycRequest>({
      query: (body) => ({ url: "/compliance/kyc", method: "POST", body }),
      invalidatesTags: ["KYC"],
    }),
    submitKyb: builder.mutation<KybResponse, { businessId: string; body: SubmitKybRequest }>({
      query: ({ businessId, body }) => ({ url: `/compliance/${businessId}/kyb`, method: "POST", body }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetKycStatusQuery, useSubmitKycMutation, useSubmitKybMutation } = complianceApi
