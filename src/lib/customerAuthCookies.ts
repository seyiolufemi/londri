import { NextResponse } from "next/server"

const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 10 // fallback if the JWT has no readable exp claim
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function accessTokenMaxAge(accessToken: string): number {
  try {
    const payload = accessToken.split(".")[1]
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"))
    const secondsRemaining = exp - Math.floor(Date.now() / 1000)
    return secondsRemaining > 0 ? secondsRemaining : DEFAULT_ACCESS_TOKEN_MAX_AGE
  } catch {
    return DEFAULT_ACCESS_TOKEN_MAX_AGE
  }
}

// Separate cookie names from the owner's access_token/refresh_token so a
// person can be signed in as both a business owner and a customer in the
// same browser without one session clobbering the other.
export function setCustomerAuthCookies(
  res: NextResponse,
  tokens: { access_token: string; refresh_token: string }
) {
  res.cookies.set("customer_access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: accessTokenMaxAge(tokens.access_token),
  })
  res.cookies.set("customer_refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export function clearCustomerAuthCookies(res: NextResponse) {
  res.cookies.delete("customer_access_token")
  res.cookies.delete("customer_refresh_token")
}
