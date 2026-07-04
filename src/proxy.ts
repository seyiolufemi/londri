import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/signup", "/login", "/kyb", "/kyb-status", "/api"]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const refreshToken = req.cookies.get("refresh_token")?.value

  if (!refreshToken) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}