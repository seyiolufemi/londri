import { NextRequest } from "next/server"
import { proxyGet } from "@/lib/proxyRoute"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ business_id: string }> }
) {
  const { business_id } = await params
  const query = req.nextUrl.searchParams.toString()
  return proxyGet(`/catalog/${business_id}/items${query ? `?${query}` : ""}`)
}
