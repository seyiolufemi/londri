import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params
  const body = await req.json()
  return proxyAuthed(req, `/orders/${order_id}/status`, { method: "PATCH", body: JSON.stringify(body) })
}
