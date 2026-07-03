import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/auth/me")
}