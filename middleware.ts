import { NextRequest, NextResponse } from 'next/server'

const COUNTRY_COOKIE = 'stationly_country'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Cloudflare añade cf-ipcountry automáticamente cuando el proxy está activo.
  // Vercel añade x-vercel-ip-country cuando el tráfico llega directo.
  // Usamos cf-ipcountry primero, luego x-vercel-ip-country como fallback.
  if (!req.cookies.get(COUNTRY_COOKIE)) {
    const country =
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-vercel-ip-country') ||
      'US'
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
