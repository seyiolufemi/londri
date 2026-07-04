import { NextRequest, NextResponse } from "next/server"
import { backendFetch, parseJsonSafe } from "@/lib/api"

export async function proxyPost(req: NextRequest, path: string) {
  const body = await req.json()

  const backendRes = await backendFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  })

  const data = await parseJsonSafe(backendRes)
  return NextResponse.json(data, { status: backendRes.status })
}

export async function proxyGet(path: string) {
  const backendRes = await backendFetch(path)
  const data = await parseJsonSafe(backendRes)
  return NextResponse.json(data, { status: backendRes.status })
}