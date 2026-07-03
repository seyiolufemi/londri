import { NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/authCookies"

// No backend endpoint revokes the refresh token server-side, so this only clears cookies.
export async function POST() {
  const res = NextResponse.json({ ok: true })
  clearAuthCookies(res)
  return res
}