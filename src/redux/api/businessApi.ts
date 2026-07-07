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

// Public directory shape — leaner than BusinessResponse (no cac number, email,
// kyb status, or is_active/is_discoverable flags). The absence of those last
// two confirms the backend already only returns qualifying businesses here,
// so the client doesn't need to re-filter by them.
export interface DiscoverableBusiness {
  id: string
  name: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  phone: string | null
  logo_url: string | null
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
    // Public, customer-facing directory — no auth required.
    getDiscoverableBusinesses: builder.query<DiscoverableBusiness[], void>({
      query: () => "/business",
      providesTags: ["Business"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useRegisterBusinessMutation,
  useGetMyBusinessQuery,
  useGetDiscoverableBusinessesQuery,
} = businessApi