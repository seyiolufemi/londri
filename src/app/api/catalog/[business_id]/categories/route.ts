import { proxyGet } from "@/lib/proxyRoute"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ business_id: string }> }
) {
  const { business_id } = await params
  return proxyGet(`/catalog/${business_id}/categories`)
}
