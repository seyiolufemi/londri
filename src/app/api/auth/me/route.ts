import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/auth/me")
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  return proxyAuthed(req, "/auth/me", { method: "PATCH", body: JSON.stringify(body) })
}