import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ business_id: string }> }
) {
  const { business_id } = await params
  const body = await req.json()
  return proxyAuthed(req, `/compliance/${business_id}/kyb`, { method: "POST", body: JSON.stringify(body) })
}
