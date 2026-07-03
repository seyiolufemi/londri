import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/compliance/kyc")
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return proxyAuthed(req, "/compliance/kyc", { method: "POST", body: JSON.stringify(body) })
}