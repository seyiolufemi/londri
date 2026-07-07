import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"
import { proxyGet } from "@/lib/proxyRoute"

export async function POST(req: NextRequest) {
  const body = await req.json()
  return proxyAuthed(req, "/business", { method: "POST", body: JSON.stringify(body) })
}

// Public business directory — no owner auth required.
export async function GET() {
  return proxyGet("/business")
}
