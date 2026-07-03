import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/api"
import { setAuthCookies } from "@/lib/authCookies"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const backendRes = await backendFetch("/auth/owner/login", {
    method: "POST",
    body: JSON.stringify(body),
  })

  const data = await backendRes.json()

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status })
  }

  const { access_token, refresh_token, id, email, role, is_email_verified } = data
  const res = NextResponse.json({ id, email, role, is_email_verified })
  setAuthCookies(res, { access_token, refresh_token })
  return res
}