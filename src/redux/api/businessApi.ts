import { apiManager } from "../apiManager"

export interface RegisterBusinessRequest {
  name: string
  cac_registration_number: string
  address: string
  city: string
  state: string
}

export interface BusinessResponse {
  id: string
  name: string
  cac_registration_number: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  phone: string
  email: string
  logo_url: string
  is_active: boolean
  is_discoverable: boolean
  current_kyb_status: string
  created_at: string
}

export const businessApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    registerBusiness: builder.mutation<BusinessResponse, RegisterBusinessRequest>({
      query: (body) => ({ url: "/business", method: "POST", body }),
      invalidatesTags: ["Business"],
    }),
    getMyBusiness: builder.query<BusinessResponse, void>({
      query: () => "/business/me",
      providesTags: ["Business"],
    }),
  }),
  overrideExisting: false,
})

export const { useRegisterBusinessMutation, useGetMyBusinessQuery } = businessApi