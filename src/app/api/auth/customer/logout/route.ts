import { NextResponse } from "next/server"
import { clearCustomerAuthCookies } from "@/lib/customerAuthCookies"

// No backend revocation endpoint given — mirrors the owner logout route,
// which also just clears cookies client-side.
export async function POST() {
  const res = NextResponse.json({ ok: true })
  clearCustomerAuthCookies(res)
  return res
}
