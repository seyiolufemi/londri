import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString()
  return proxyAuthed(req, `/accounts/bank/lookup?${query}`)
}
