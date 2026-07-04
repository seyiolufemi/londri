import { NextRequest } from "next/server"
import { proxyGet } from "@/lib/proxyRoute"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET() {
  return proxyGet("/catalog/plans")
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return proxyAuthed(req, "/catalog/plans", { method: "POST", body: JSON.stringify(body) })
}
