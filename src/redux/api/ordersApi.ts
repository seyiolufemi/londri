import { apiManager } from "../apiManager"

export type OrderChannel = "online_booking" | "walk_in" | "subscription_fulfillment"

export type OrderStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "in_progress"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled"

export type OrderPaymentStatus = "pending" | "paid" | "refunded"

// Shared across orders and transactions list filters.
export type Period = "today" | "this_week" | "this_month" | "last_3_months" | "all_time" | "custom"

export interface Pagination {
  total: number
  limit: number
  offset: number
}

export interface OrderLineItemRequest {
  price_list_item_id: string
  quantity: number
}

export interface CreateOrderRequest {
  business_id: string
  items: OrderLineItemRequest[]
  channel: OrderChannel
  customer_name: string
  customer_email: string
  customer_whatsapp?: string
  to_be_delivered: boolean
  delivery_address?: string
  notes?: string
  scheduled_pickup_at?: string
}

export interface OrderLineItem {
  id: string
  price_list_item_id: string
  item_name: string
  service_types: string[]
  unit: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface OrderStatusEvent {
  id: string
  from_status: string
  to_status: string
  actor_id: string
  actor_role: string
  note: string
  timestamp: string
}

export interface Order {
  id: string
  business_id: string
  reference_id: string
  channel: OrderChannel
  status: OrderStatus
  payment_status: OrderPaymentStatus
  customer_name: string
  customer_email: string
  customer_whatsapp: string
  to_be_delivered: boolean
  delivery_address: string
  notes: string
  amount: number
  scheduled_pickup_at: string | null
  created_at: string
  updated_at: string
  items: OrderLineItem[]
  status_events: OrderStatusEvent[]
}

export interface CreateOrderResponse {
  order: Order
  transaction_reference_id: string
  checkout_link: string
}

// List rows are a summary shape — no items/status_events (fetch order detail for that).
export interface OrderSummary {
  id: string
  reference_id: string
  channel: OrderChannel
  status: OrderStatus
  payment_status: OrderPaymentStatus
  customer_name: string
  amount: number
  created_at: string
}

export interface OrderStats {
  active_orders: number
  completed_orders: number
  cancelled_orders: number
  total_order_value: number
}

export interface ListOrdersParams {
  status?: OrderStatus
  payment_status?: OrderPaymentStatus
  channel?: OrderChannel
  reference_id?: string
  period?: Period
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface ListOrdersResponse {
  orders: OrderSummary[]
  stats: OrderStats
  pagination: Pagination
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  note?: string
}

export const ordersApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    // Docs call this public/customer-facing, but the backend actually requires
    // the owner's bearer token (see the route handler) — it 401s without it.
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    listOrders: builder.query<ListOrdersResponse, ListOrdersParams | void>({
      query: (params) => ({ url: "/orders", params: params ?? {} }),
      providesTags: ["Order"],
    }),
    getOrder: builder.query<Order, string>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<Order, { orderId: string; body: UpdateOrderStatusRequest }>({
      query: ({ orderId, body }) => ({ url: `/orders/${orderId}/status`, method: "PATCH", body }),
      invalidatesTags: ["Order"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateOrderMutation,
  useListOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} = ordersApi
