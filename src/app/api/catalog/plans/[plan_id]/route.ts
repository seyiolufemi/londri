import { NextRequest } from "next/server"
import { proxyGet } from "@/lib/proxyRoute"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ plan_id: string }> }
) {
  const { plan_id } = await params
  return proxyGet(`/catalog/plans/${plan_id}`)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ plan_id: string }> }
) {
  const { plan_id } = await params
  const body = await req.json()
  return proxyAuthed(req, `/catalog/plans/${plan_id}`, { method: "PATCH", body: JSON.stringify(body) })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ plan_id: string }> }
) {
  const { plan_id } = await params
  return proxyAuthed(req, `/catalog/plans/${plan_id}`, { method: "DELETE" })
}
