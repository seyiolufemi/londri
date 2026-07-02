export type KybStatus = "pending" | "under_review" | "approved" | "rejected"
export type OrderStatus = "requested" | "confirmed" | "picked_up" | "in_progress" | "ready" | "completed" | "cancelled"
export type OrderChannel = "online" | "walk_in" | "subscription"
export type PaymentStatus = "paid" | "unpaid"
export type TransactionType = "payment" | "refund" | "payout" | "subscription"
export type TransactionStatus = "successful" | "pending" | "failed"
export type SubscriptionStatus = "active" | "paused" | "expired" | "cancelled"
export type PriceCategory = "clothing" | "bedding" | "household" | "specialty"

export interface Business {
  id: string
  name: string
  registrationNumber: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  kybStatus: KybStatus
  createdAt: string
}

export interface KybSubmission {
  id: string
  businessId: string
  cacCertificate: string
  utilityBill: string
  ownerIdType: "nin" | "passport" | "drivers_license"
  ownerIdUrl: string
  businessAddress: string
  submittedAt: string
  reviewedAt: string | null
  reviewNote: string | null
  status: KybStatus
}

export interface PriceListItem {
  id: string
  name: string
  category: PriceCategory
  price: number
  unit: string
  description: string
  isActive: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billingCycle: "monthly" | "quarterly" | "annually"
  credits: number
  features: string[]
  isPopular: boolean
  isActive: boolean
}

export interface CustomerSubscription {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  planId: string
  planName: string
  status: SubscriptionStatus
  creditsUsed: number
  creditsTotal: number
  startDate: string
  endDate: string
  nextBillingDate: string
}

export interface Order {
  id: string
  reference: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  channel: OrderChannel
  paymentStatus: PaymentStatus
  pickupAddress: string
  deliveryAddress: string
  pickupDate: string
  estimatedDeliveryDate: string
  actualDeliveryDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  priceListItemId: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderStatusEvent {
  id: string
  orderId: string
  status: OrderStatus
  note: string | null
  createdAt: string
  createdBy: string
}

export interface Transaction {
  id: string
  reference: string
  orderId: string | null
  customerName: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  channel: "card" | "bank_transfer" | "ussd" | "cash"
  description: string
  createdAt: string
}
