import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

// Docs call this public/customer-facing, but the real backend rejects it
// without a bearer token — forward the owner's access token like every
// other authed route.
export async function POST(req: NextRequest) {
  const body = await req.json()
  return proxyAuthed(req, "/orders", { method: "POST", body: JSON.stringify(body) })
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString()
  return proxyAuthed(req, `/orders${query ? `?${query}` : ""}`)
}
