import { NextRequest, NextResponse } from "next/server"
import { backendFetch, parseJsonSafe } from "@/lib/api"

export async function proxyAuthed(req: NextRequest, path: string, init: RequestInit = {}) {
  const accessToken = req.cookies.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const backendRes = await backendFetch(path, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await parseJsonSafe(backendRes)
  return NextResponse.json(data, { status: backendRes.status })
}