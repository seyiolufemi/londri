"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  Business,
  KybSubmission,
  PriceListItem,
  SubscriptionPlan,
  Order,
  OrderStatusEvent,
  Transaction,
  CustomerSubscription,
  KybStatus,
  OrderStatus,
  Payout,
  PayoutStatus,
  Notification,
} from "@/types"
import {
  businesses as initialBusinesses,
  kybSubmissions as initialKybSubmissions,
  priceListItems as initialPriceListItems,
  subscriptionPlans as initialSubscriptionPlans,
  customerSubscriptions as initialCustomerSubscriptions,
  orders as initialOrders,
  orderStatusEvents as initialOrderStatusEvents,
  transactions as initialTransactions,
  itemCategories as initialItemCategories,
  payouts as initialPayouts,
  notifications as initialNotifications,
} from "./data"

export interface SignupFormData {
  businessName: string
  ownerName: string
  email: string
  phone: string
  password: string
}

export interface KybFormData {
  cacNumber: string
  businessAddress: string
  state: string
  city: string
  bvn: string
  nin: string
  idType: string
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
}

interface StoreState {
  signupData: SignupFormData
  signupStep: 1 | 2
  setSignupData: (data: Partial<SignupFormData>) => void
  setSignupStep: (step: 1 | 2) => void

  kybData: KybFormData
  kybStep: 1 | 2 | 3 | 4
  setKybData: (data: Partial<KybFormData>) => void
  setKybStep: (step: 1 | 2 | 3 | 4) => void
  resetKybData: () => void

  kybStatus: KybStatus
  setKybStatus: (status: KybStatus) => void

  businesses: Business[]
  kybSubmissions: KybSubmission[]
  priceListItems: PriceListItem[]
  subscriptionPlans: SubscriptionPlan[]
  customerSubscriptions: CustomerSubscription[]
  orders: Order[]
  orderStatusEvents: OrderStatusEvent[]
  transactions: Transaction[]
  itemCategories: string[]
  payouts: Payout[]

  availableBalance: number
  totalPaidOut: number

  businessBankName: string
  businessAccountNumber: string
  businessAccountName: string

  setBusinesses: (businesses: Business[]) => void
  setKybSubmissions: (submissions: KybSubmission[]) => void
  setPriceListItems: (items: PriceListItem[]) => void
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void
  setCustomerSubscriptions: (subscriptions: CustomerSubscription[]) => void
  setOrders: (orders: Order[]) => void
  setOrderStatusEvents: (events: OrderStatusEvent[]) => void
  setTransactions: (transactions: Transaction[]) => void

  addItemCategory: (category: string) => void
  deleteItemCategory: (category: string) => void

  addSubscriptionPlan: (plan: SubscriptionPlan) => void
  updateSubscriptionPlan: (id: string, updates: Partial<SubscriptionPlan>) => void
  deleteSubscriptionPlan: (id: string) => void
  togglePlanActive: (id: string) => void
  addCustomerSubscription: (subscription: CustomerSubscription) => void

  addOrder: (order: Order) => void
  addOrderStatusEvent: (event: OrderStatusEvent) => void
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void
  updateOrderPaymentStatus: (orderId: string, paymentStatus: "paid" | "unpaid" | "refunded") => void
  addTransaction: (transaction: Transaction) => void
  resolveTransaction: (id: string, note: string) => void

  addPriceListItem: (item: PriceListItem) => void
  updatePriceListItem: (id: string, updates: Partial<PriceListItem>) => void
  deletePriceListItem: (id: string) => void
  togglePriceListItemActive: (id: string) => void

  addPayout: (payout: Payout) => void
  updatePayoutStatus: (id: string, status: PayoutStatus) => void
  addToTotalPaidOut: (amount: number) => void

  businessProfile: BusinessProfileSettings
  setBusinessProfile: (profile: Partial<BusinessProfileSettings>) => void
  setBusinessBankDetails: (bankName: string, accountNumber: string, accountName: string) => void

  profileEmail: string
  profilePhone: string
  profileAvatarUrl: string | null
  setProfileEmail: (email: string) => void
  setProfilePhone: (phone: string) => void
  setProfileAvatarUrl: (url: string | null) => void

  notifications: Notification[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

export interface OperatingDay {
  open: boolean
  openTime: string
  closeTime: string
}

export interface BusinessProfileSettings {
  businessName: string
  description: string
  address: string
  serviceAreaRadius: number
  featuredServiceId: string | null
  illustrationIndex: number
  operatingHours: Record<string, OperatingDay>
}

const DEFAULT_OPERATING_HOURS: Record<string, OperatingDay> = {
  Mon: { open: true, openTime: "08:00", closeTime: "18:00" },
  Tue: { open: true, openTime: "08:00", closeTime: "18:00" },
  Wed: { open: true, openTime: "08:00", closeTime: "18:00" },
  Thu: { open: true, openTime: "08:00", closeTime: "18:00" },
  Fri: { open: true, openTime: "08:00", closeTime: "18:00" },
  Sat: { open: true, openTime: "09:00", closeTime: "16:00" },
  Sun: { open: false, openTime: "10:00", closeTime: "14:00" },
}

const DEFAULT_BUSINESS_PROFILE: BusinessProfileSettings = {
  businessName: "Sparkle Wash Laundry",
  description: "",
  address: "12 Adeola Odeku Street, Victoria Island",
  serviceAreaRadius: 5,
  featuredServiceId: null,
  illustrationIndex: 0,
  operatingHours: DEFAULT_OPERATING_HOURS,
}

const EMPTY_KYB_DATA: KybFormData = {
  cacNumber: "", businessAddress: "", state: "", city: "",
  bvn: "", nin: "", idType: "", bankName: "", bankCode: "", accountNumber: "", accountName: "",
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
  signupData: { businessName: "", ownerName: "", email: "", phone: "", password: "" },
  signupStep: 1,
  setSignupData: (data) => set((state) => ({ signupData: { ...state.signupData, ...data } })),
  setSignupStep: (signupStep) => set({ signupStep }),

  kybData: EMPTY_KYB_DATA,
  kybStep: 1,
  setKybData: (data) => set((state) => ({ kybData: { ...state.kybData, ...data } })),
  setKybStep: (kybStep) => set({ kybStep }),
  resetKybData: () => set({ kybStep: 1, kybData: EMPTY_KYB_DATA }),

  kybStatus: "pending",
  setKybStatus: (kybStatus) => set({ kybStatus }),

  businesses: initialBusinesses,
  kybSubmissions: initialKybSubmissions,
  priceListItems: initialPriceListItems,
  subscriptionPlans: initialSubscriptionPlans,
  customerSubscriptions: initialCustomerSubscriptions,
  orders: initialOrders,
  orderStatusEvents: initialOrderStatusEvents,
  transactions: initialTransactions,
  itemCategories: initialItemCategories,
  payouts: initialPayouts,

  availableBalance: 340000,
  totalPaidOut: 1850000,

  businessBankName: "GTBank",
  businessAccountNumber: "0123456789",
  businessAccountName: "AMARA OKONKWO",

  setBusinesses: (businesses) => set({ businesses }),
  setKybSubmissions: (kybSubmissions) => set({ kybSubmissions }),
  setPriceListItems: (priceListItems) => set({ priceListItems }),
  setSubscriptionPlans: (subscriptionPlans) => set({ subscriptionPlans }),
  setCustomerSubscriptions: (customerSubscriptions) => set({ customerSubscriptions }),
  setOrders: (orders) => set({ orders }),
  setOrderStatusEvents: (orderStatusEvents) => set({ orderStatusEvents }),
  setTransactions: (transactions) => set({ transactions }),

  addItemCategory: (category) =>
    set((state) => {
      const exists = state.itemCategories.some(
        (c) => c.toLowerCase() === category.toLowerCase()
      )
      if (exists) return {}
      return { itemCategories: [...state.itemCategories, category] }
    }),

  deleteItemCategory: (category) =>
    set((state) => ({
      itemCategories: state.itemCategories.filter(
        (c) => c.toLowerCase() !== category.toLowerCase()
      ),
    })),

  addSubscriptionPlan: (plan) =>
    set((state) => ({ subscriptionPlans: [...state.subscriptionPlans, plan] })),

  updateSubscriptionPlan: (id, updates) =>
    set((state) => ({
      subscriptionPlans: state.subscriptionPlans.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deleteSubscriptionPlan: (id) =>
    set((state) => ({
      subscriptionPlans: state.subscriptionPlans.filter((p) => p.id !== id),
    })),

  togglePlanActive: (id) =>
    set((state) => ({
      subscriptionPlans: state.subscriptionPlans.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ),
    })),

  addCustomerSubscription: (subscription) =>
    set((state) => ({
      customerSubscriptions: [...state.customerSubscriptions, subscription],
    })),

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  addOrderStatusEvent: (event) =>
    set((state) => ({ orderStatusEvents: [...state.orderStatusEvents, event] })),

  updateOrderStatus: (orderId, newStatus) =>
    set((state) => {
      const now = new Date().toISOString()
      const newEvent: OrderStatusEvent = {
        id: `evt_${Date.now()}`,
        orderId,
        status: newStatus,
        note: null,
        createdAt: now,
        createdBy: "staff",
      }
      return {
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, updatedAt: now } : o
        ),
        orderStatusEvents: [...state.orderStatusEvents, newEvent],
      }
    }),

  updateOrderPaymentStatus: (orderId, paymentStatus) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, paymentStatus } : o
      ),
    })),

  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),

  resolveTransaction: (id, note) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, matchStatus: "matched", resolutionNote: note } : t
      ),
    })),

  addPriceListItem: (item) =>
    set((state) => ({ priceListItems: [...state.priceListItems, item] })),

  updatePriceListItem: (id, updates) =>
    set((state) => ({
      priceListItems: state.priceListItems.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deletePriceListItem: (id) =>
    set((state) => ({
      priceListItems: state.priceListItems.filter((p) => p.id !== id),
    })),

  togglePriceListItemActive: (id) =>
    set((state) => ({
      priceListItems: state.priceListItems.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ),
    })),

  addPayout: (payout) =>
    set((state) => ({
      payouts: [payout, ...state.payouts],
      availableBalance: state.availableBalance - payout.amount,
    })),

  updatePayoutStatus: (id, status) =>
    set((state) => ({
      payouts: state.payouts.map((p) => (p.id === id ? { ...p, status } : p)),
    })),

  addToTotalPaidOut: (amount) =>
    set((state) => ({ totalPaidOut: state.totalPaidOut + amount })),

  businessProfile: DEFAULT_BUSINESS_PROFILE,
  setBusinessProfile: (profile) =>
    set((state) => ({ businessProfile: { ...state.businessProfile, ...profile } })),
  setBusinessBankDetails: (bankName, accountNumber, accountName) =>
    set({ businessBankName: bankName, businessAccountNumber: accountNumber, businessAccountName: accountName }),

  profileEmail: "amara@sparklewash.ng",
  profilePhone: "+234 801 234 5678",
  profileAvatarUrl: null,
  setProfileEmail: (profileEmail) => set({ profileEmail }),
  setProfilePhone: (profilePhone) => set({ profilePhone }),
  setProfileAvatarUrl: (profileAvatarUrl) => set({ profileAvatarUrl }),

  notifications: initialNotifications,
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
    }),
    {
      name: "londri-kyb-progress",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ kybStep: state.kybStep, kybData: state.kybData }),
    }
  )
)
