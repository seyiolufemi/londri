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

export function setAuthCookies(
  res: NextResponse,
  tokens: { access_token: string; refresh_token: string }
) {
  res.cookies.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: accessTokenMaxAge(tokens.access_token),
  })
  res.cookies.set("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.delete("access_token")
  res.cookies.delete("refresh_token")
}
