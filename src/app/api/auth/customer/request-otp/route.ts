import { NextRequest, NextResponse } from "next/server"
import { backendFetch, parseJsonSafe } from "@/lib/api"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const backendRes = await backendFetch("/auth/customer/request-otp", {
    method: "POST",
    body: JSON.stringify(body),
  })
  const data = await parseJsonSafe(backendRes)
  return NextResponse.json(data, { status: backendRes.status })
}
