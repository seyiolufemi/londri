import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react"
import { logOut } from "./slices/authSlice"

// Points at this app's own Route Handlers, not the FastAPI backend directly —
// the access/refresh tokens live in httpOnly cookies the browser attaches
// automatically, so the client never needs to see or send them itself.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
})

let refreshPromise: ReturnType<typeof rawBaseQuery> | null = null

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = rawBaseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions
      )
    }

    const refreshResult = await refreshPromise
    refreshPromise = null

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logOut())
    }
  }

  return result
}

export const apiManager = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Business", "KYC", "Category", "PriceListItem", "SubscriptionPlan"],
  endpoints: () => ({}),
})