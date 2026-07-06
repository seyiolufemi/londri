import { NextRequest } from "next/server"
import { proxyPost } from "@/lib/proxyRoute"
import { proxyAuthed } from "@/lib/authedProxy"

// Customer-facing checkout — no owner auth required by the backend.
export async function POST(req: NextRequest) {
  return proxyPost(req, "/orders")
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString()
  return proxyAuthed(req, `/orders${query ? `?${query}` : ""}`)
}
