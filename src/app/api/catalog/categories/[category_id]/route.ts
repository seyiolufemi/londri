import { NextRequest } from "next/server"
import { proxyAuthed } from "@/lib/authedProxy"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ category_id: string }> }
) {
  const { category_id } = await params
  return proxyAuthed(req, `/catalog/categories/${category_id}`, { method: "DELETE" })
}
