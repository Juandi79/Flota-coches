import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('sb-refresh-token')?.value

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtected = ['/dashboard', '/vehicles', '/reservations', '/calendar', '/maintenance', '/inspecciones'].some(
    path => request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/vehicles/:path*', '/reservations/:path*', '/calendar/:path*', '/maintenance/:path*', '/inspecciones/:path*', '/login']
}
