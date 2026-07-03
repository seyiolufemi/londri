import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/api"
import { setAuthCookies, clearAuthCookies } from "@/lib/authCookies"

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value

  if (!refreshToken) {
    return NextResponse.json({ error: "No session" }, { status: 401 })
  }

  const backendRes = await backendFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!backendRes.ok) {
    const res = NextResponse.json({ error: "Session expired" }, { status: 401 })
    clearAuthCookies(res)
    return res
  }

  const { access_token, refresh_token } = await backendRes.json()
  const res = NextResponse.json({ ok: true })
  setAuthCookies(res, { access_token, refresh_token })
  return res
}