import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/signup", "/kyb", "/kyb-status", "/api/auth"]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const accessToken = req.cookies.get("access_token")?.value

  if (!accessToken) {
    const url = req.nextUrl.clone()
    url.pathname = "/signup"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}