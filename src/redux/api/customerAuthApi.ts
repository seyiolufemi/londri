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
  }),
  overrideExisting: false,
})

export const {
  useRequestCustomerOtpMutation,
  useVerifyCustomerOtpMutation,
  useCustomerLogoutMutation,
} = customerAuthApi
