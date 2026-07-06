import { NextRequest, NextResponse } from "next/server"

// Prefix matches — any path starting with these is public.
const PUBLIC_PREFIXES = ["/signup", "/login", "/kyb", "/kyb-status", "/api", "/business", "/discover"]
// Exact matches — must equal the pathname (can't use startsWith("/") — matches everything).
const PUBLIC_EXACT = ["/"]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
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