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
  }),
  overrideExisting: false,
})

export const { useGetKycStatusQuery, useSubmitKycMutation } = complianceApi