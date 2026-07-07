import { NextRequest, NextResponse } from "next/server"
import { backendFetch, parseJsonSafe } from "@/lib/api"

// Public/customer checkout — attaches the customer's bearer token when
// signed in, but unlike the owner dashboard's create-order call, a missing
// token here means guest checkout rather than a 401.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const accessToken = req.cookies.get("customer_access_token")?.value

  const backendRes = await backendFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  const data = await parseJsonSafe(backendRes)
  return NextResponse.json(data, { status: backendRes.status })
}
