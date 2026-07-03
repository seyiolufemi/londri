import { NextRequest } from "next/server"
import { proxyPost } from "@/lib/proxyRoute"

export async function POST(req: NextRequest) {
  return proxyPost(req, "/auth/owner/verify-email")
}