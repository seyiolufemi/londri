import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ transaction_id: string }> }
) {
  const { transaction_id } = await params
  return proxyAuthed(req, `/transactions/${transaction_id}`)
}
