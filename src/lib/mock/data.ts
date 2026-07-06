import type {
  Business,
  KybSubmission,
  PriceListItem,
  SubscriptionPlan,
  Order,
  OrderStatusEvent,
  Transaction,
  CustomerSubscription,
  Payout,
  Notification,
  DiscoveryBusiness,
  ServiceType,
  OperatingDay,
  CustomerOrder,
} from "@/types"

// ─── Date helpers ─────────────────────────────────────────────────────────────
// All mock dates are computed relative to now so filters always show live data.
// daysBack > 0 = past, daysBack < 0 = future.

function d(daysBack: number, utcHour = 9, utcMinute = 0): string {
  const dt = new Date()
  dt.setUTCDate(dt.getUTCDate() - daysBack)
  dt.setUTCHours(utcHour, utcMinute, 0, 0)
  return dt.toISOString()
}

function monthLabel(daysBack: number): string {
  const dt = new Date()
  dt.setUTCDate(dt.getUTCDate() - daysBack)
  return dt.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

// ─── Static data ──────────────────────────────────────────────────────────────

export const businesses: Business[] = [
  {
    id: "biz_001",
    name: "Sparkle Wash & Dry",
    registrationNumber: "RC-1284756",
    ownerName: "Chukwuemeka Okafor",
    email: "emeka@sparklewash.ng",
    phone: "08031245678",
    address: "14 Admiralty Way",
    city: "Lekki",
    state: "Lagos",
    kybStatus: "approved",
    createdAt: "2025-01-15T09:00:00Z",
  },
  {
    id: "biz_002",
    name: "CleanSheen Laundry",
    registrationNumber: "RC-9932014",
    ownerName: "Fatima Abdullahi",
    email: "fatima@cleansheen.ng",
    phone: "07053219876",
    address: "23 Ahmadu Bello Way",
    city: "Abuja",
    state: "FCT",
    kybStatus: "under_review",
    createdAt: "2025-03-02T11:30:00Z",
  },
  {
    id: "biz_003",
    name: "FreshPress Lagos",
    registrationNumber: "RC-4471822",
    ownerName: "Adaeze Nwosu",
    email: "adaeze@freshpress.ng",
    phone: "08120934512",
    address: "7 Bode Thomas Street",
    city: "Surulere",
    state: "Lagos",
    kybStatus: "pending",
    createdAt: "2025-05-10T14:00:00Z",
  },
]

export const kybSubmissions: KybSubmission[] = [
  {
    id: "kyb_001",
    businessId: "biz_001",
    cacCertificate: "https://storage.londri.ng/docs/kyb_001_cac.pdf",
    utilityBill: "https://storage.londri.ng/docs/kyb_001_bill.pdf",
    ownerIdType: "nin",
    ownerIdUrl: "https://storage.londri.ng/docs/kyb_001_id.pdf",
    businessAddress: "14 Admiralty Way, Lekki, Lagos",
    submittedAt: "2025-01-16T10:00:00Z",
    reviewedAt: "2025-01-20T15:00:00Z",
    reviewNote: "All documents verified successfully.",
    status: "approved",
  },
  {
    id: "kyb_002",
    businessId: "biz_002",
    cacCertificate: "https://storage.londri.ng/docs/kyb_002_cac.pdf",
    utilityBill: "https://storage.londri.ng/docs/kyb_002_bill.pdf",
    ownerIdType: "passport",
    ownerIdUrl: "https://storage.londri.ng/docs/kyb_002_id.pdf",
    businessAddress: "23 Ahmadu Bello Way, Abuja, FCT",
    submittedAt: "2025-03-03T09:00:00Z",
    reviewedAt: null,
    reviewNote: null,
    status: "under_review",
  },
]

export const priceListItems: PriceListItem[] = [
  {
    id: "item_001",
    name: "Plain Shirt",
    category: "clothing",
    serviceTypes: ["wash"],
    price: 800,
    unit: "per item",
    turnaround: "24 hours",
    description: "Wash, dry and press",
    isActive: true,
  },
  {
    id: "item_002",
    name: "Trousers",
    category: "clothing",
    serviceTypes: ["wash", "iron"],
    price: 800,
    unit: "per item",
    turnaround: "24 hours",
    description: "Wash, dry and press",
    isActive: true,
  },
  {
    id: "item_003",
    name: "Native Senator",
    category: "clothing",
    serviceTypes: ["wash", "iron"],
    price: 2000,
    unit: "per item",
    turnaround: "48 hours",
    description: "Hand wash, dry and press",
    isActive: true,
  },
  {
    id: "item_004",
    name: "Agbada (complete set)",
    category: "clothing",
    serviceTypes: ["wash", "dry_clean", "iron"],
    price: 6500,
    unit: "per item",
    turnaround: "48 hours",
    description: "3-piece agbada, hand washed and starched",
    isActive: true,
  },
  {
    id: "item_005",
    name: "Suit (complete)",
    category: "clothing",
    serviceTypes: ["dry_clean", "iron"],
    price: 4500,
    unit: "per item",
    turnaround: "48 hours",
    description: "Jacket and trousers, dry cleaned and pressed",
    isActive: true,
  },
  {
    id: "item_006",
    name: "Gown / Dress",
    category: "clothing",
    serviceTypes: ["wash", "iron"],
    price: 2500,
    unit: "per item",
    turnaround: "24 hours",
    description: "Wash, dry and press",
    isActive: true,
  },
  {
    id: "item_007",
    name: "Bed Sheet (Single)",
    category: "bedding",
    serviceTypes: ["wash"],
    price: 2000,
    unit: "per item",
    turnaround: "24 hours",
    description: "Wash, dry and fold",
    isActive: true,
  },
  {
    id: "item_008",
    name: "Bed Sheet (King)",
    category: "bedding",
    serviceTypes: ["wash", "iron"],
    price: 3500,
    unit: "per item",
    turnaround: "24 hours",
    description: "Wash, dry and fold",
    isActive: true,
  },
  {
    id: "item_009",
    name: "Duvet (Single)",
    category: "bedding",
    serviceTypes: ["wash"],
    price: 5000,
    unit: "per kg",
    turnaround: "48 hours",
    description: "Machine wash with softener and dry",
    isActive: true,
  },
  {
    id: "item_010",
    name: "Duvet (King)",
    category: "bedding",
    serviceTypes: ["wash"],
    price: 8000,
    unit: "per kg",
    turnaround: "48 hours",
    description: "Machine wash with softener and dry",
    isActive: true,
  },
  {
    id: "item_011",
    name: "Curtain (per panel)",
    category: "household",
    serviceTypes: ["wash", "iron"],
    price: 3000,
    unit: "per item",
    turnaround: "48 hours",
    description: "Wash, dry and press",
    isActive: true,
  },
  {
    id: "item_012",
    name: "Towel",
    category: "household",
    serviceTypes: ["wash"],
    price: 1000,
    unit: "per item",
    turnaround: "24 hours",
    description: "Wash and dry with softener",
    isActive: true,
  },
]

// ─── Customer discovery businesses ────────────────────────────────────────────
// Each references a subset of the price list items above; serviceTypes and
// cheapestPrice are derived from those items so the cards stay in sync with pricing.

interface DiscoverySpec {
  id: string
  name: string
  illustrationVariant: string
  distanceKm: number
  hours: { open: string; close: string }
  isOpen: boolean
  itemIds: string[]
  address: string
  closedDays?: string[] // defaults to ["Sun"]
  whatsappNumber: string
}

const SERVICE_TYPE_ORDER: ServiceType[] = ["wash", "dry_clean", "iron"]
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function buildWeeklyHours(
  open: string,
  close: string,
  closedDays: string[] = ["Sun"]
): Record<string, OperatingDay> {
  const hours: Record<string, OperatingDay> = {}
  WEEK_DAYS.forEach((day) => {
    hours[day] = { open: !closedDays.includes(day), openTime: open, closeTime: close }
  })
  return hours
}

function buildDiscoveryBusiness(spec: DiscoverySpec): DiscoveryBusiness {
  const items = spec.itemIds
    .map((id) => priceListItems.find((p) => p.id === id))
    .filter((p): p is PriceListItem => Boolean(p))

  const serviceSet = new Set<ServiceType>()
  items.forEach((it) => it.serviceTypes.forEach((s) => serviceSet.add(s)))
  const serviceTypes = SERVICE_TYPE_ORDER.filter((s) => serviceSet.has(s))
  const cheapestPrice = items.length ? Math.min(...items.map((i) => i.price)) : 0

  return {
    id: spec.id,
    name: spec.name,
    illustrationVariant: spec.illustrationVariant,
    distanceKm: spec.distanceKm,
    hours: spec.hours,
    isOpen: spec.isOpen,
    serviceTypes,
    cheapestPrice,
    address: spec.address,
    operatingHours: buildWeeklyHours(spec.hours.open, spec.hours.close, spec.closedDays),
    itemIds: spec.itemIds,
    whatsappNumber: spec.whatsappNumber,
  }
}

export const discoveryBusinesses: DiscoveryBusiness[] = [
  {
    id: "disc_001",
    name: "Sparkle Wash & Dry",
    illustrationVariant: "variant-01-white.svg",
    distanceKm: 0.8,
    hours: { open: "08:00", close: "20:00" },
    isOpen: true,
    itemIds: ["item_001", "item_002", "item_004"],
    address: "14 Admiralty Way, Lekki Phase 1, Lagos",
    whatsappNumber: "+234 801 234 5678",
  },
  {
    id: "disc_002",
    name: "CleanSheen Laundry",
    illustrationVariant: "variant-02-coral.svg",
    distanceKm: 1.2,
    hours: { open: "07:30", close: "21:00" },
    isOpen: true,
    itemIds: ["item_007", "item_008", "item_009"],
    address: "23 Ahmadu Bello Way, Victoria Island, Lagos",
    closedDays: [],
    whatsappNumber: "+234 705 321 9876",
  },
  {
    id: "disc_003",
    name: "FreshPress Lagos",
    illustrationVariant: "variant-08-skyblue.svg",
    distanceKm: 2.5,
    hours: { open: "09:00", close: "18:00" },
    isOpen: false,
    itemIds: ["item_005", "item_006"],
    address: "7 Bode Thomas Street, Surulere, Lagos",
    whatsappNumber: "+234 812 093 4512",
  },
  {
    id: "disc_004",
    name: "Bubbles & Co.",
    illustrationVariant: "variant-04-sage.svg",
    distanceKm: 1.7,
    hours: { open: "08:00", close: "19:00" },
    isOpen: true,
    itemIds: ["item_001", "item_003"],
    address: "45 Akin Adesola Street, Victoria Island, Lagos",
    whatsappNumber: "+234 909 876 5432",
  },
  {
    id: "disc_005",
    name: "Crisp Laundromat",
    illustrationVariant: "variant-06-rose.svg",
    distanceKm: 3.1,
    hours: { open: "10:00", close: "17:00" },
    isOpen: false,
    itemIds: ["item_011", "item_012"],
    address: "12 Ogui Road, Enugu",
    closedDays: ["Sun", "Mon"],
    whatsappNumber: "+234 803 456 7890",
  },
  {
    id: "disc_006",
    name: "Marina Wash House",
    illustrationVariant: "variant-09-plum.svg",
    distanceKm: 4.3,
    hours: { open: "08:30", close: "20:30" },
    isOpen: true,
    itemIds: ["item_004", "item_005", "item_006"],
    address: "78 Isaac John Street, GRA Ikeja, Lagos",
    whatsappNumber: "+234 706 654 3210",
  },
].map(buildDiscoveryBusiness)

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_001",
    name: "Starter",
    price: 10000,
    billingCycle: "monthly",
    credits: 20,
    categories: ["clothing", "bedding", "household", "specialty"],
    description: "Perfect for households with light laundry needs. Covers all fabric categories.",
    features: [
      "20 laundry credits/month",
      "Free pickup within 5km",
      "48-hour turnaround",
      "Basic support",
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: "plan_002",
    name: "Standard",
    price: 22000,
    billingCycle: "monthly",
    credits: 50,
    categories: ["clothing"],
    description: "Ideal for regular households with moderate clothing laundry needs. Priority support included.",
    features: [
      "50 laundry credits/month",
      "Free pickup within 10km",
      "24-hour turnaround",
      "Priority support",
      "Free express delivery",
    ],
    isPopular: true,
    isActive: true,
  },
  {
    id: "plan_003",
    name: "Premium",
    price: 42000,
    billingCycle: "monthly",
    credits: 120,
    categories: ["clothing", "bedding", "household", "specialty"],
    description: "Full-service plan for large households. Same-day turnaround with dedicated account manager.",
    features: [
      "120 laundry credits/month",
      "Free pickup anywhere in city",
      "Same-day turnaround",
      "Dedicated account manager",
      "Free express delivery",
      "Garment protection insurance",
    ],
    isPopular: false,
    isActive: true,
  },
]

// ─── Subscriptions — dates relative to now ────────────────────────────────────

export const customerSubscriptions: CustomerSubscription[] = [
  {
    id: "sub_001",
    customerId: "cust_001",
    customerName: "Tunde Adeyemi",
    customerPhone: "08012345678",
    planId: "plan_002",
    planName: "Standard",
    status: "active",
    creditsUsed: 23,
    creditsTotal: 50,
    startDate: d(34, 0, 0),
    endDate: d(-27, 23, 59),
    nextBillingDate: d(-27, 0, 0),
  },
  {
    id: "sub_002",
    customerId: "cust_002",
    customerName: "Ngozi Eze",
    customerPhone: "07033421560",
    planId: "plan_001",
    planName: "Starter",
    status: "active",
    creditsUsed: 18,
    creditsTotal: 20,
    startDate: d(30, 0, 0),
    endDate: d(-31, 23, 59),
    nextBillingDate: d(-31, 0, 0),
  },
  {
    id: "sub_003",
    customerId: "cust_003",
    customerName: "Babajide Ogundimu",
    customerPhone: "09012873456",
    planId: "plan_003",
    planName: "Premium",
    status: "paused",
    creditsUsed: 45,
    creditsTotal: 120,
    startDate: d(56, 0, 0),
    endDate: d(26, 23, 59),
    nextBillingDate: d(-5, 0, 0),
  },
  {
    id: "sub_004",
    customerId: "cust_004",
    customerName: "Amaka Obiora",
    customerPhone: "08065432100",
    planId: "plan_002",
    planName: "Standard",
    status: "expired",
    creditsUsed: 50,
    creditsTotal: 50,
    startDate: d(65, 0, 0),
    endDate: d(35, 23, 59),
    nextBillingDate: d(35, 0, 0),
  },
]

// ─── Orders — dates relative to now ──────────────────────────────────────────
// ord_001: completed ~55 days ago
// ord_002: in_progress ~4 days ago (this week / this month)
// ord_003: ready ~3 days ago (this week / this month)
// ord_004: requested today

export const orders: Order[] = [
  {
    id: "ord_001",
    reference: "LDR-20260601-0001",
    customerId: "cust_001",
    customerName: "Tunde Adeyemi",
    customerPhone: "08012345678",
    items: [
      { priceListItemId: "item_001", name: "Plain Shirt", quantity: 3, unitPrice: 800, subtotal: 2400 },
      { priceListItemId: "item_002", name: "Trousers", quantity: 2, unitPrice: 800, subtotal: 1600 },
    ],
    totalAmount: 4000,
    status: "completed",
    channel: "online",
    paymentStatus: "paid",
    pickupAddress: "45 Akin Adesola Street, Victoria Island, Lagos",
    deliveryAddress: "45 Akin Adesola Street, Victoria Island, Lagos",
    pickupDate: d(55, 9, 0),
    estimatedDeliveryDate: d(54, 17, 0),
    actualDeliveryDate: d(54, 15, 30),
    notes: null,
    createdAt: d(55, 8, 0),
    updatedAt: d(54, 15, 30),
  },
  {
    id: "ord_002",
    reference: "LDR-20260615-0002",
    customerId: "cust_002",
    customerName: "Ngozi Eze",
    customerPhone: "07033421560",
    items: [
      { priceListItemId: "item_004", name: "Agbada (complete set)", quantity: 1, unitPrice: 6500, subtotal: 6500 },
      { priceListItemId: "item_007", name: "Bed Sheet (Single)", quantity: 2, unitPrice: 2000, subtotal: 4000 },
    ],
    totalAmount: 10500,
    status: "in_progress",
    channel: "walk_in",
    paymentStatus: "paid",
    pickupAddress: "12 Ogui Road, Enugu",
    deliveryAddress: "12 Ogui Road, Enugu",
    pickupDate: d(4, 10, 0),
    estimatedDeliveryDate: d(3, 17, 0),
    actualDeliveryDate: null,
    notes: "Handle agbada with care, embroidered",
    createdAt: d(4, 9, 0),
    updatedAt: d(4, 11, 0),
  },
  {
    id: "ord_003",
    reference: "LDR-20260618-0003",
    customerId: "cust_005",
    customerName: "Segun Lawal",
    customerPhone: "08099123456",
    items: [
      { priceListItemId: "item_005", name: "Suit (complete)", quantity: 2, unitPrice: 4500, subtotal: 9000 },
      { priceListItemId: "item_006", name: "Gown / Dress", quantity: 1, unitPrice: 2500, subtotal: 2500 },
    ],
    totalAmount: 11500,
    status: "ready",
    channel: "subscription",
    paymentStatus: "paid",
    pickupAddress: "3 Bourdillon Road, Ikoyi, Lagos",
    deliveryAddress: "3 Bourdillon Road, Ikoyi, Lagos",
    pickupDate: d(3, 8, 0),
    estimatedDeliveryDate: d(2, 17, 0),
    actualDeliveryDate: null,
    notes: null,
    createdAt: d(3, 7, 30),
    updatedAt: d(3, 16, 0),
  },
  {
    id: "ord_004",
    reference: "LDR-20260620-0004",
    customerId: "cust_003",
    customerName: "Babajide Ogundimu",
    customerPhone: "09012873456",
    items: [
      { priceListItemId: "item_009", name: "Duvet (Single)", quantity: 1, unitPrice: 5000, subtotal: 5000 },
      { priceListItemId: "item_011", name: "Curtain (per panel)", quantity: 4, unitPrice: 3000, subtotal: 12000 },
    ],
    totalAmount: 17000,
    status: "requested",
    channel: "online",
    paymentStatus: "unpaid",
    pickupAddress: "78 Isaac John Street, GRA Ikeja, Lagos",
    deliveryAddress: "78 Isaac John Street, GRA Ikeja, Lagos",
    pickupDate: d(0, 11, 0),
    estimatedDeliveryDate: d(-2, 17, 0),
    actualDeliveryDate: null,
    notes: "Curtains are blackout type",
    createdAt: d(0, 10, 0),
    updatedAt: d(0, 11, 30),
  },
]

export const orderStatusEvents: OrderStatusEvent[] = [
  { id: "evt_001", orderId: "ord_001", status: "requested",  note: "Order placed",                createdAt: d(55, 8, 0),  createdBy: "system"    },
  { id: "evt_002", orderId: "ord_001", status: "confirmed",  note: "Order confirmed",              createdAt: d(55, 9, 30), createdBy: "staff_001" },
  { id: "evt_003", orderId: "ord_001", status: "picked_up",  note: "Items picked up from customer",createdAt: d(55, 11, 0), createdBy: "rider_001" },
  { id: "evt_004", orderId: "ord_001", status: "in_progress",note: "Washing in progress",          createdAt: d(55, 14, 0), createdBy: "staff_001" },
  { id: "evt_005", orderId: "ord_001", status: "ready",      note: "Ready for delivery",           createdAt: d(54, 10, 0), createdBy: "staff_001" },
  { id: "evt_006", orderId: "ord_001", status: "completed",  note: "Delivered to customer",        createdAt: d(54, 15, 30),createdBy: "rider_001" },
  { id: "evt_007", orderId: "ord_002", status: "requested",  note: "Order placed",                 createdAt: d(4, 9, 0),   createdBy: "system"    },
  { id: "evt_008", orderId: "ord_002", status: "confirmed",  note: "Order confirmed",              createdAt: d(4, 10, 30), createdBy: "staff_002" },
  { id: "evt_009", orderId: "ord_002", status: "picked_up",  note: "Items picked up",              createdAt: d(4, 12, 0),  createdBy: "rider_001" },
  { id: "evt_010", orderId: "ord_002", status: "in_progress",note: "Hand-washing agbada",          createdAt: d(4, 14, 0),  createdBy: "staff_002" },
  { id: "evt_011", orderId: "ord_003", status: "requested",  note: "Order placed",                 createdAt: d(3, 7, 30),  createdBy: "system"    },
  { id: "evt_012", orderId: "ord_003", status: "confirmed",  note: "Order confirmed",              createdAt: d(3, 8, 30),  createdBy: "staff_001" },
  { id: "evt_013", orderId: "ord_003", status: "picked_up",  note: "Items picked up",              createdAt: d(3, 10, 0),  createdBy: "rider_001" },
  { id: "evt_014", orderId: "ord_003", status: "in_progress",note: "Dry cleaning in progress",     createdAt: d(3, 11, 0),  createdBy: "staff_001" },
  { id: "evt_015", orderId: "ord_003", status: "ready",      note: "Suits pressed and bagged",     createdAt: d(3, 16, 0),  createdBy: "staff_001" },
  { id: "evt_016", orderId: "ord_004", status: "requested",  note: "Order placed",                 createdAt: d(0, 10, 0),  createdBy: "system"    },
]

export const itemCategories: string[] = [
  "Clothing",
  "Bedding",
  "Household",
  "Specialty",
]

// ─── Transactions — spread across last 3 months, concentrated in current week/month
// txn_001 & txn_002: ~55 days ago (last 3 months range)
// txn_006: ~35 days ago (last month)
// txn_003: ~4 days ago (this week + this month)
// txn_004: ~3 days ago (this week + this month)
// txn_005: today (today + this week + this month)

export const transactions: Transaction[] = [
  {
    id: "txn_001",
    reference: "PAY-20260601-ABC123",
    orderId: "ord_001",
    customerName: "Tunde Adeyemi",
    type: "payment",
    amount: 4000,
    status: "successful",
    channel: "card",
    description: "Payment for order LDR-20260601-0001",
    matchStatus: "matched",
    resolutionNote: null,
    createdAt: d(55, 8, 5),
  },
  {
    id: "txn_002",
    reference: "SUB-20260601-DEF456",
    orderId: null,
    customerName: "Tunde Adeyemi",
    type: "subscription",
    amount: 22000,
    status: "successful",
    channel: "card",
    description: "Standard plan subscription renewal",
    matchStatus: "matched",
    resolutionNote: null,
    createdAt: d(55, 0, 1),
  },
  {
    id: "txn_006",
    reference: "REF-20260610-PQR678",
    orderId: null,
    customerName: "Amaka Obiora",
    type: "refund",
    amount: 3200,
    status: "successful",
    channel: "bank_transfer",
    description: "Partial refund - damaged item claim",
    matchStatus: "unmatched",
    resolutionNote: null,
    createdAt: d(35, 13, 0),
  },
  {
    id: "txn_003",
    reference: "PAY-20260615-GHI789",
    orderId: "ord_002",
    customerName: "Ngozi Eze",
    type: "payment",
    amount: 10500,
    status: "successful",
    channel: "bank_transfer",
    description: "Payment for order LDR-20260615-0002",
    matchStatus: "matched",
    resolutionNote: null,
    createdAt: d(4, 9, 5),
  },
  {
    id: "txn_004",
    reference: "PAY-20260618-JKL012",
    orderId: "ord_003",
    customerName: "Segun Lawal",
    type: "payment",
    amount: 11500,
    status: "successful",
    channel: "card",
    description: "Payment for order LDR-20260618-0003",
    matchStatus: "matched",
    resolutionNote: null,
    createdAt: d(3, 7, 35),
  },
  {
    id: "txn_005",
    reference: "PAY-20260620-MNO345",
    orderId: "ord_004",
    customerName: "Babajide Ogundimu",
    type: "payment",
    amount: 17000,
    status: "pending",
    channel: "ussd",
    description: "Payment for order LDR-20260620-0004",
    matchStatus: "unmatched",
    resolutionNote: null,
    createdAt: d(0, 10, 5),
  },
]

// ─── Payouts — relative dates (most recent first) ─────────────────────────────

export const payouts: Payout[] = [
  {
    id: "payout_001",
    businessId: "biz_001",
    amount: 500000,
    status: "completed",
    bankReference: "NMB-391047",
    period: monthLabel(5),
    createdAt: d(5, 14, 0),
  },
  {
    id: "payout_002",
    businessId: "biz_001",
    amount: 750000,
    status: "completed",
    bankReference: "NMB-284736",
    period: monthLabel(37),
    createdAt: d(37, 10, 30),
  },
  {
    id: "payout_003",
    businessId: "biz_001",
    amount: 600000,
    status: "completed",
    bankReference: "NMB-193847",
    period: monthLabel(67),
    createdAt: d(67, 11, 0),
  },
]

// ─── Notifications — relative Date objects, newest first ─────────────────────

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000)
}
function daysAgo(days: number, extraHours = 0): Date {
  return new Date(Date.now() - (days * 24 + extraHours) * 60 * 60 * 1000)
}

export const notifications: Notification[] = [
  {
    id: "ntf_001",
    type: "new_order",
    title: "New order received",
    message: "Babajide Ogundimu placed order #LDR-20260620-0004 for ₦17,000. Items include 1 Duvet (Single) and 4 Curtain panels.",
    read: false,
    createdAt: hoursAgo(2),
    linkTo: "/orders",
  },
  {
    id: "ntf_002",
    type: "payment_received",
    title: "Payment received",
    message: "₦11,500 received from Segun Lawal for order #LDR-20260618-0003 via card.",
    read: false,
    createdAt: hoursAgo(3),
    linkTo: "/transactions",
  },
  {
    id: "ntf_003",
    type: "new_subscriber",
    title: "New subscriber",
    message: "Chidinma Obi has subscribed to the Premium plan at ₦42,000/month.",
    read: false,
    createdAt: hoursAgo(5),
    linkTo: "/subscriptions",
  },
  {
    id: "ntf_004",
    type: "unmatched_transaction",
    title: "Unmatched transaction",
    message: "A bank transfer of ₦17,000 received today could not be automatically matched to any order. Please review.",
    read: false,
    createdAt: hoursAgo(8),
    linkTo: "/transactions",
  },
  {
    id: "ntf_005",
    type: "new_order",
    title: "New order received",
    message: "Segun Lawal placed order #LDR-20260618-0003 for ₦11,500. Includes 2 suits and 1 gown for dry cleaning.",
    read: false,
    createdAt: daysAgo(1, 2),
    linkTo: "/orders",
  },
  {
    id: "ntf_006",
    type: "payment_received",
    title: "Payment received",
    message: "₦10,500 received from Ngozi Eze for order #LDR-20260615-0002 via bank transfer.",
    read: false,
    createdAt: daysAgo(1, 5),
    linkTo: "/transactions",
  },
  {
    id: "ntf_007",
    type: "kyb_status",
    title: "KYB documents under review",
    message: "Your verification documents have been received and are currently under review. You'll be notified once the process is complete.",
    read: true,
    createdAt: daysAgo(2),
    linkTo: "/settings",
  },
  {
    id: "ntf_008",
    type: "withdrawal_completed",
    title: "Withdrawal completed",
    message: "Your withdrawal of ₦85,000 to GTBank (****6789) has been processed and should arrive within 1 business day.",
    read: true,
    createdAt: daysAgo(3),
    linkTo: "/transactions",
  },
  {
    id: "ntf_009",
    type: "new_order",
    title: "New order received",
    message: "Ngozi Eze placed order #LDR-20260615-0002 for ₦10,500. Includes Agbada (complete set) and 2 bed sheets.",
    read: true,
    createdAt: daysAgo(4, 3),
    linkTo: "/orders",
  },
  {
    id: "ntf_010",
    type: "new_subscriber",
    title: "New subscriber",
    message: "Kemi Abubakar has subscribed to the Standard plan at ₦22,000/month.",
    read: true,
    createdAt: daysAgo(5),
    linkTo: "/subscriptions",
  },
  {
    id: "ntf_011",
    type: "payment_received",
    title: "Payment received",
    message: "₦4,000 received from Tunde Adeyemi for order #LDR-20260601-0001 via card.",
    read: true,
    createdAt: daysAgo(7),
    linkTo: "/transactions",
  },
  {
    id: "ntf_012",
    type: "unmatched_transaction",
    title: "Unmatched transaction",
    message: "A bank transfer of ₦22,000 received 8 days ago is still unmatched. Review and resolve in your transactions.",
    read: true,
    createdAt: daysAgo(8),
    linkTo: "/transactions",
  },
  {
    id: "ntf_013",
    type: "new_order",
    title: "New order received",
    message: "Femi Okafor placed a new order for ₦6,800. Items include 3 Plain Shirts and 2 Trousers.",
    read: true,
    createdAt: daysAgo(10),
    linkTo: "/orders",
  },
  {
    id: "ntf_014",
    type: "withdrawal_completed",
    title: "Withdrawal completed",
    message: "Your withdrawal of ₦120,000 to GTBank (****6789) has been settled and credited to your account.",
    read: true,
    createdAt: daysAgo(12),
    linkTo: "/transactions",
  },
  {
    id: "ntf_015",
    type: "kyb_status",
    title: "Business verification approved",
    message: "Congratulations! Your KYB documents have been reviewed and approved. Your account is now fully verified.",
    read: true,
    createdAt: daysAgo(14),
    linkTo: "/settings",
  },
  {
    id: "ntf_016",
    type: "payment_received",
    title: "Payment received",
    message: "₦8,500 received from Seun Bello via card. The order has been confirmed and is now in progress.",
    read: true,
    createdAt: daysAgo(16),
    linkTo: "/transactions",
  },
  {
    id: "ntf_017",
    type: "new_subscriber",
    title: "New subscriber",
    message: "Emeka Chukwu has subscribed to the Starter plan at ₦10,000/month.",
    read: true,
    createdAt: daysAgo(18),
    linkTo: "/subscriptions",
  },
  {
    id: "ntf_018",
    type: "unmatched_transaction",
    title: "Unmatched transaction",
    message: "A cash payment of ₦5,500 received at walk-in could not be matched to any pending order.",
    read: true,
    createdAt: daysAgo(20),
    linkTo: "/transactions",
  },
]

// ─── Customer order history — mock past orders for the signed-in customer account ──

export const mockCustomerOrders: CustomerOrder[] = [
  {
    id: "corder_001",
    businessId: "disc_001",
    businessName: "Sparkle Wash & Dry",
    reference: "LDR-482913",
    items: [
      { priceListItemId: "item_001", name: "Plain Shirt", quantity: 3, unitPrice: 800, subtotal: 2400 },
      { priceListItemId: "item_002", name: "Trousers", quantity: 2, unitPrice: 800, subtotal: 1600 },
    ],
    totalAmount: 4000,
    status: "completed",
    pickupAddress: "45 Akin Adesola Street, Victoria Island, Lagos",
    createdAt: d(2, 10, 0),
  },
  {
    id: "corder_002",
    businessId: "disc_002",
    businessName: "CleanSheen Laundry",
    reference: "LDR-719204",
    items: [
      { priceListItemId: "item_008", name: "Bed Sheet (King)", quantity: 1, unitPrice: 3500, subtotal: 3500 },
      { priceListItemId: "item_009", name: "Duvet (Single)", quantity: 1, unitPrice: 5000, subtotal: 5000 },
    ],
    totalAmount: 8500,
    status: "in_progress",
    pickupAddress: "12 Bourdillon Road, Ikoyi, Lagos",
    createdAt: d(5, 14, 30),
  },
  {
    id: "corder_003",
    businessId: "disc_004",
    businessName: "Bubbles & Co.",
    reference: "LDR-350871",
    items: [
      { priceListItemId: "item_003", name: "Native Senator", quantity: 1, unitPrice: 2000, subtotal: 2000 },
    ],
    totalAmount: 2000,
    status: "ready",
    pickupAddress: "45 Akin Adesola Street, Victoria Island, Lagos",
    createdAt: d(10, 9, 15),
  },
  {
    id: "corder_004",
    businessId: "disc_003",
    businessName: "FreshPress Lagos",
    reference: "LDR-926450",
    items: [
      { priceListItemId: "item_005", name: "Suit (complete)", quantity: 1, unitPrice: 4500, subtotal: 4500 },
      { priceListItemId: "item_006", name: "Gown / Dress", quantity: 1, unitPrice: 2500, subtotal: 2500 },
    ],
    totalAmount: 7000,
    status: "requested",
    pickupAddress: "7 Bode Thomas Street, Surulere, Lagos",
    createdAt: d(15, 16, 45),
  },
  {
    id: "corder_005",
    businessId: "disc_006",
    businessName: "Marina Wash House",
    reference: "LDR-138762",
    items: [
      { priceListItemId: "item_004", name: "Agbada (complete set)", quantity: 1, unitPrice: 6500, subtotal: 6500 },
    ],
    totalAmount: 6500,
    status: "completed",
    pickupAddress: "78 Isaac John Street, GRA Ikeja, Lagos",
    createdAt: d(20, 11, 0),
  },
]
