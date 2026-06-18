import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = process.env.BETA_PASSWORD || 'stationly2025'
const COOKIE = 'stationly_auth'
const COUNTRY_COOKIE = 'stationly_country'

export function middleware(req: NextRequest) {
    const cookie = req.cookies.get(COOKIE)?.value
    const { pathname } = req.nextUrl

  let res: NextResponse
    if (cookie === PASSWORD || pathname === '/enter') {
          res = NextResponse.next()
    } else {
          res = NextResponse.redirect(new URL('/enter', req.url))
    }

  // Vercel añade x-vercel-ip-country automáticamente.
  // La guardamos en cookie para saber si mostrar amazon.es o amazon.com.
  if (!req.cookies.get(COUNTRY_COOKIE)) {
        const country = req.headers.get('x-vercel-ip-country') || 'US'
        res.cookies.set(COUNTRY_COOKIE, country, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
        })
  }

  return res
}

export const config = {
    matcher: ['/((?!_next|favicon.ico|api).*)'],
}
