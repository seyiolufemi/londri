import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params
  return proxyAuthed(req, `/orders/${order_id}`)
}
