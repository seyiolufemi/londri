"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/mock/store"
import { useAppDispatch } from "@/hooks/redux"
import { apiManager } from "@/redux/apiManager"
import { useGetCustomerMeQuery } from "@/redux/api/customerAuthApi"

function isUnauthorized(error: unknown): boolean {
  return !!error && typeof error === "object" && "status" in error && (error as { status: unknown }).status === 401
}

// Centralizes the customer auth gate for /account/* pages:
// - never signed in (no persisted session) -> redirect to /account/login
// - signed in but the token has expired/been revoked (401 on /auth/me) ->
//   sign out locally and redirect to the homepage, not back to login
export function useCustomerSession() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const hasHydrated = useStore((s) => s.hasHydrated)
  const isAuthenticated = useStore((s) => s.customerAuth.isAuthenticated)
  const customerSignOut = useStore((s) => s.customerSignOut)

  const {
    data: me,
    error,
    isLoading: isLoadingMe,
  } = useGetCustomerMeQuery(undefined, { skip: !hasHydrated || !isAuthenticated })

  const sessionExpired = isUnauthorized(error)

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.replace("/account/login")
      return
    }

    if (sessionExpired) {
      dispatch(apiManager.util.resetApiState())
      customerSignOut()
      router.replace("/")
    }
  }, [hasHydrated, isAuthenticated, sessionExpired, dispatch, customerSignOut, router])

  return {
    hasHydrated,
    isAuthenticated: isAuthenticated && !sessionExpired,
    me,
    isLoadingMe,
  }
}
