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
  updateOrderPaymentStatus: (orderId: string, paymentStatus: "paid" | "unpaid") => void
  addTransaction: (transaction: Transaction) => void
  addPriceListItem: (item: PriceListItem) => void
  updatePriceListItem: (id: string, updates: Partial<PriceListItem>) => void
  deletePriceListItem: (id: string) => void
  togglePriceListItemActive: (id: string) => void
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
    }),
    {
      name: "londri-kyb-progress",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ kybStep: state.kybStep, kybData: state.kybData }),
    }
  )
)
