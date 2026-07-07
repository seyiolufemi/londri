import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/api"
import { setCustomerAuthCookies } from "@/lib/customerAuthCookies"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const backendRes = await backendFetch("/auth/customer/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
  })

  const data = await backendRes.json()

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status })
  }

  const { access_token, refresh_token, id, role, is_new_user } = data
  const res = NextResponse.json({ id, role, is_new_user })
  setCustomerAuthCookies(res, { access_token, refresh_token })
  return res
}
