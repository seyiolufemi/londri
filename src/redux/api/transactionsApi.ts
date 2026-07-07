import { apiManager } from "../apiManager"
import type { Pagination, Period } from "./ordersApi"

// Note the mismatch with order.payment_status (pending/paid/refunded) — these
// two fields don't share an enum, per the API docs.
export type TransactionStatus = "pending" | "success" | "failed" | "refunded"

export interface Transaction {
  id: string
  business_id: string
  order_id: string
  reference_id: string
  merchant_tx_ref: string
  amount: number
  currency: string
  status: TransactionStatus
  // Real API sends null until the payment gateway reports which channel was used.
  payment_channel: string | null
  paid_at: string | null
  created_at: string
}

export interface ListTransactionsParams {
  status?: TransactionStatus
  reference_id?: string
  period?: Period
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface ListTransactionsResponse {
  transactions: Transaction[]
  pagination: Pagination
  available_balance: number
}

export const transactionsApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    listTransactions: builder.query<ListTransactionsResponse, ListTransactionsParams | void>({
      query: (params) => ({ url: "/transactions", params: params ?? {} }),
      providesTags: ["Transaction"],
    }),
    getTransaction: builder.query<Transaction, string>({
      query: (transactionId) => `/transactions/${transactionId}`,
      providesTags: ["Transaction"],
    }),
  }),
  overrideExisting: false,
})

export const { useListTransactionsQuery, useGetTransactionQuery } = transactionsApi
