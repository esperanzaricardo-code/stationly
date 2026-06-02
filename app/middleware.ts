import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = 'stationly2025'
const COOKIE = 'stationly_auth'

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE)?.value
  if (cookie === PASSWORD) return NextResponse.next()

  const { pathname } = req.nextUrl
  if (pathname === '/enter') return NextResponse.next()

  return NextResponse.redirect(new URL('/enter', req.url))
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}
