import { NextRequest } from "next/server"
import { proxyCustomerAuthed } from "@/lib/customerAuthedProxy"

export async function GET(req: NextRequest) {
  return proxyCustomerAuthed(req, "/auth/me")
}
