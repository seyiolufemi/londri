import { apiManager } from "../apiManager"

export interface RegisterOwnerRequest {
  name: string
  email: string
  password: string
  phone: string
}
export interface RegisterOwnerResponse { id: string; email: string; message: string }

export interface VerifyEmailRequest { email: string; otp_code: string }
export interface ResendVerificationRequest { email: string }

export interface LoginRequest { email: string; password: string }
export interface LoginResponse {
  id: string
  email: string
  role: string
  is_email_verified: boolean
}

export interface ForgotPasswordRequest { email: string }
export interface ResetPasswordRequest { email: string; otp_code: string; new_password: string }

export interface MeResponse {
  id: string
  name: string
  email: string
  phone: string
  role: string
  is_email_verified: boolean
}

export interface MessageResponse { message: string }

export const authApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    registerOwner: builder.mutation<RegisterOwnerResponse, RegisterOwnerRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    verifyOwnerEmail: builder.mutation<MessageResponse, VerifyEmailRequest>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    resendOwnerVerification: builder.mutation<MessageResponse, ResendVerificationRequest>({
      query: (body) => ({ url: "/auth/resend-verification", method: "POST", body }),
    }),
    loginOwner: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User", "Business", "KYC"],
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useRegisterOwnerMutation,
  useVerifyOwnerEmailMutation,
  useResendOwnerVerificationMutation,
  useLoginOwnerMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi