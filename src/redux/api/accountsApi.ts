import { apiManager } from "../apiManager"

export interface Bank {
  code: string
  name: string
}

export interface LookupBankAccountRequest {
  account_number: string
  bank_code: string
}

export interface BankAccountLookupResponse {
  account_name: string
  account_number: string
  bank_code: string
}

export interface SaveBankAccountRequest {
  account_number: string
  bank_code: string
}

export interface BankAccountResponse {
  id: number
  account_number: string
  bank_code: string
  account_name: string
  is_default: boolean
}

export const accountsApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    getBanks: builder.query<Bank[], void>({
      query: () => "/accounts/banks",
    }),
    lookupBankAccount: builder.query<BankAccountLookupResponse, LookupBankAccountRequest>({
      query: (params) => ({ url: "/accounts/bank/lookup", params }),
    }),
    saveBankAccount: builder.mutation<BankAccountResponse, SaveBankAccountRequest>({
      query: (body) => ({ url: "/accounts/bank", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBanksQuery,
  useLazyLookupBankAccountQuery,
  useSaveBankAccountMutation,
} = accountsApi
