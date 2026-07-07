import { apiManager } from "../apiManager"

export interface RequestCustomerOtpRequest {
  name: string
  email: string
}

export interface VerifyCustomerOtpRequest {
  email: string
  otp_code: string
}

export interface VerifyCustomerOtpResponse {
  id: string
  role: string
  is_new_user: boolean
}

// Shape unconfirmed — mirrors the owner's /auth/me response as a starting
// guess (same path, presumably role-aware on the backend). Fix field names
// once we see the real payload.
export interface CustomerMeResponse {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

export const customerAuthApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    requestCustomerOtp: builder.mutation<unknown, RequestCustomerOtpRequest>({
      query: (body) => ({ url: "/auth/customer/request-otp", method: "POST", body }),
    }),
    verifyCustomerOtp: builder.mutation<VerifyCustomerOtpResponse, VerifyCustomerOtpRequest>({
      query: (body) => ({ url: "/auth/customer/verify-otp", method: "POST", body }),
    }),
    customerLogout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/auth/customer/logout", method: "POST" }),
    }),
    getCustomerMe: builder.query<CustomerMeResponse, void>({
      query: () => "/auth/customer/me",
    }),
  }),
  overrideExisting: false,
})

export const {
  useRequestCustomerOtpMutation,
  useVerifyCustomerOtpMutation,
  useCustomerLogoutMutation,
  useGetCustomerMeQuery,
} = customerAuthApi
