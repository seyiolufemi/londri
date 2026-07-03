import { NextResponse } from "next/server"

const ACCESS_TOKEN_MAX_AGE = 60 * 10 // 10 min — backend doesn't return an expiry
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function setAuthCookies(
  res: NextResponse,
  tokens: { access_token: string; refresh_token: string }
) {
  res.cookies.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  res.cookies.set("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.delete("access_token")
  res.cookies.delete("refresh_token")
}