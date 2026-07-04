import { apiManager } from "../apiManager"

export interface Category {
  id: string
  business_id: string
  name: string
  created_at: string
}

export interface CreateCategoryRequest {
  name: string
}

export interface CreateCategoryResponse {
  data: string
  message: string
  code: number
}

export interface CategoriesListResponse {
  categories: Category[]
  message: string
}

export interface PriceListItem {
  id: string
  business_id: string
  category_id: string
  name: string
  service_types: string[]
  unit: string
  price: number
  turnaround_hours: number
  description: string
  is_active: boolean
  created_at: string
}

export interface CreatePriceListItemRequest {
  name: string
  category_id: string
  service_types: string[]
  unit: string
  price: number
  turnaround_hours: number
  description: string
}

export interface UpdatePriceListItemRequest extends CreatePriceListItemRequest {
  updated_at?: string
}

export interface GetItemsParams {
  businessId: string
  category_id?: string
  service_type?: string
  search?: string
  include_inactive?: boolean
}

export type BillingCycle = "weekly" | "monthly" | "yearly"
export type CancelPolicy = "at_period_end" | "immediate"

export interface SubscriptionPlan {
  id: string
  business_id: string
  name: string
  description: string
  price: number
  billing_cycle: string
  item_cap: number
  eligible_category_ids: string[]
  cancel_policy: string
  is_active: boolean
  created_at: string
}

export interface CreatePlanRequest {
  name: string
  description: string
  price: number
  billing_cycle: BillingCycle
  item_cap: number
  eligible_category_ids: string[]
  cancel_policy: CancelPolicy
}

export const catalogApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<CreateCategoryResponse, CreateCategoryRequest>({
      query: (body) => ({ url: "/catalog/categories", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    getCategories: builder.query<CategoriesListResponse[], string>({
      query: (businessId) => `/catalog/${businessId}/categories`,
      providesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (categoryId) => ({ url: `/catalog/categories/${categoryId}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),

    createPriceListItem: builder.mutation<PriceListItem, CreatePriceListItemRequest>({
      query: (body) => ({ url: "/catalog/items", method: "POST", body }),
      invalidatesTags: ["PriceListItem"],
    }),
    updatePriceListItem: builder.mutation<PriceListItem, { itemId: string; body: UpdatePriceListItemRequest }>({
      query: ({ itemId, body }) => ({ url: `/catalog/items/${itemId}`, method: "PATCH", body }),
      invalidatesTags: ["PriceListItem"],
    }),
    deletePriceListItem: builder.mutation<void, string>({
      query: (itemId) => ({ url: `/catalog/items/${itemId}`, method: "DELETE" }),
      invalidatesTags: ["PriceListItem"],
    }),
    toggleItemActive: builder.mutation<void, string>({
      query: (itemId) => ({ url: `/catalog/items/${itemId}/toggle`, method: "PATCH" }),
      invalidatesTags: ["PriceListItem"],
    }),
    getItems: builder.query<PriceListItem[], GetItemsParams>({
      query: ({ businessId, ...params }) => ({ url: `/catalog/${businessId}/items`, params }),
      providesTags: ["PriceListItem"],
    }),

    getAllPlans: builder.query<SubscriptionPlan[], void>({
      query: () => "/catalog/plans",
      providesTags: ["SubscriptionPlan"],
    }),
    createPlan: builder.mutation<SubscriptionPlan, CreatePlanRequest>({
      query: (body) => ({ url: "/catalog/plans", method: "POST", body }),
      invalidatesTags: ["SubscriptionPlan"],
    }),
    updatePlan: builder.mutation<SubscriptionPlan, { planId: string; body: CreatePlanRequest }>({
      query: ({ planId, body }) => ({ url: `/catalog/plans/${planId}`, method: "PATCH", body }),
      invalidatesTags: ["SubscriptionPlan"],
    }),
    deactivatePlan: builder.mutation<SubscriptionPlan, string>({
      query: (planId) => ({ url: `/catalog/plans/${planId}`, method: "DELETE" }),
      invalidatesTags: ["SubscriptionPlan"],
    }),
    getPlan: builder.query<SubscriptionPlan, string>({
      query: (planId) => `/catalog/plans/${planId}`,
      providesTags: ["SubscriptionPlan"],
    }),
    getPlansForBusiness: builder.query<SubscriptionPlan[], string>({
      query: (businessId) => `/catalog/${businessId}/plans`,
      providesTags: ["SubscriptionPlan"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useCreatePriceListItemMutation,
  useUpdatePriceListItemMutation,
  useDeletePriceListItemMutation,
  useToggleItemActiveMutation,
  useGetItemsQuery,
  useGetAllPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeactivatePlanMutation,
  useGetPlanQuery,
  useGetPlansForBusinessQuery,
} = catalogApi
