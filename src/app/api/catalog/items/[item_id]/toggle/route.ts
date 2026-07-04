import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ item_id: string }> }
) {
  const { item_id } = await params
  return proxyAuthed(req, `/catalog/items/${item_id}/toggle`, { method: "PATCH" })
}
