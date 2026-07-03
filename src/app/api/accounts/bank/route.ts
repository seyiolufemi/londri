import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function POST(req: NextRequest) {
  const body = await req.json()
  return proxyAuthed(req, "/accounts/bank", { method: "POST", body: JSON.stringify(body) })
}
