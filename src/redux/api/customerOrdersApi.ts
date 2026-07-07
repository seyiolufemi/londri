import { apiManager } from "../apiManager"

export interface CustomerOrderItem {
  item_name: string
  quantity: number
}

// Note: no unique `id` field — reference_id is the only identifier available,
// and there's no per-order detail endpoint, so the detail page filters this
// same list rather than fetching by id.
export interface CustomerOrder {
  reference_id: string
  status: string
  customer_name: string
  amount: number
  created_at: string
  items: CustomerOrderItem[]
}

export const customerOrdersApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerOrders: builder.query<CustomerOrder[], void>({
      query: () => "/orders/customer",
    }),
  }),
  overrideExisting: false,
})

export const { useGetCustomerOrdersQuery } = customerOrdersApi
