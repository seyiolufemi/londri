"use client"

import { create } from "zustand"
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
} from "./data"

export interface SignupFormData {
  businessName: string
  ownerName: string
  email: string
  phone: string
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

  setBusinesses: (businesses: Business[]) => void
  setKybSubmissions: (submissions: KybSubmission[]) => void
  setPriceListItems: (items: PriceListItem[]) => void
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void
  setCustomerSubscriptions: (subscriptions: CustomerSubscription[]) => void
  setOrders: (orders: Order[]) => void
  setOrderStatusEvents: (events: OrderStatusEvent[]) => void
  setTransactions: (transactions: Transaction[]) => void

  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, event: OrderStatusEvent) => void
  addTransaction: (transaction: Transaction) => void
  updatePriceListItem: (item: PriceListItem) => void
}

export const useStore = create<StoreState>((set) => ({
  signupData: { businessName: "", ownerName: "", email: "", phone: "" },
  signupStep: 1,
  setSignupData: (data) => set((state) => ({ signupData: { ...state.signupData, ...data } })),
  setSignupStep: (signupStep) => set({ signupStep }),

  kybData: {
    cacNumber: "", businessAddress: "", state: "", city: "",
    bvn: "", nin: "", idType: "", bankName: "", accountNumber: "", accountName: "",
  },
  kybStep: 1,
  setKybData: (data) => set((state) => ({ kybData: { ...state.kybData, ...data } })),
  setKybStep: (kybStep) => set({ kybStep }),

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

  setBusinesses: (businesses) => set({ businesses }),
  setKybSubmissions: (kybSubmissions) => set({ kybSubmissions }),
  setPriceListItems: (priceListItems) => set({ priceListItems }),
  setSubscriptionPlans: (subscriptionPlans) => set({ subscriptionPlans }),
  setCustomerSubscriptions: (customerSubscriptions) => set({ customerSubscriptions }),
  setOrders: (orders) => set({ orders }),
  setOrderStatusEvents: (orderStatusEvents) => set({ orderStatusEvents }),
  setTransactions: (transactions) => set({ transactions }),

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  updateOrderStatus: (orderId, event) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: event.status, updatedAt: event.createdAt } : o
      ),
      orderStatusEvents: [...state.orderStatusEvents, event],
    })),

  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),

  updatePriceListItem: (item) =>
    set((state) => ({
      priceListItems: state.priceListItems.map((p) => (p.id === item.id ? item : p)),
    })),
}))
