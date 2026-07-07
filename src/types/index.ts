export type KybStatus = "pending" | "under_review" | "approved" | "rejected"
export type OrderStatus = "requested" | "confirmed" | "picked_up" | "in_progress" | "ready" | "completed" | "cancelled"
export type OrderChannel = "online" | "walk_in" | "subscription"
export type PaymentStatus = "paid" | "unpaid" | "refunded"
export type TransactionType = "payment" | "refund" | "payout" | "subscription"
export type TransactionStatus = "successful" | "pending" | "failed"
export type PayoutStatus = "processing" | "completed" | "failed"
export type SubscriptionStatus = "active" | "paused" | "expired" | "cancelled"
export type PriceCategory = "clothing" | "bedding" | "household" | "specialty"
export type ServiceType = "wash" | "dry_clean" | "iron"

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

export interface OperatingDay {
  open: boolean
  openTime: string
  closeTime: string
}

// Customer-facing view of a laundry business, shown on the public discovery pages.
export interface DiscoveryBusiness {
  id: string
  name: string
  illustrationVariant: string // washing machine SVG filename, e.g. "variant-02-coral.svg"
  distanceKm: number
  hours: { open: string; close: string }
  isOpen: boolean
  serviceTypes: ServiceType[] // derived from the business's price list items
  cheapestPrice: number // derived from the business's price list items
  address: string
  operatingHours: Record<string, OperatingDay> // keyed "Mon".."Sun"
  itemIds: string[] // price list items this business offers, for the detail page's menu
  whatsappNumber: string
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
  serviceTypes: ServiceType[]
  price: number
  unit: string
  turnaround: string
  description: string
  isActive: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billingCycle: "weekly" | "monthly" | "quarterly" | "annually"
  credits: number
  categories: PriceCategory[]
  description: string
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
  matchStatus: "matched" | "unmatched"
  resolutionNote: string | null
  createdAt: string
}

export interface Payout {
  id: string
  businessId: string
  amount: number
  status: PayoutStatus
  bankReference: string
  period: string
  createdAt: string
}

export type NotificationType =
  | "new_order"
  | "payment_received"
  | "kyb_status"
  | "withdrawal_completed"
  | "new_subscriber"
  | "unmatched_transaction"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
  linkTo?: string
}

// Customer cart line item — quantity of one price list item at one business.
export interface CartItem {
  priceListItemId: string
  quantity: number
}

// A signed-in customer's past order, shown in their order history. Distinct
// from the owner-side Order (which belongs to one business by definition) —
// a customer's orders can span multiple businesses, hence businessId/businessName.
export interface CustomerOrder {
  id: string
  businessId: string
  businessName: string
  reference: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  pickupAddress: string
  createdAt: string
}

export interface CustomerAuth {
  isAuthenticated: boolean
  id: string | null
  name: string | null
  email: string | null
  role: string | null
}
