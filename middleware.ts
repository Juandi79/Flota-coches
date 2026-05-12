import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(c => c.name.includes('supabase') || c.name.includes('sb-'))

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtected = ['/dashboard', '/vehicles', '/reservations', '/calendar', '/maintenance', '/inspecciones'].some(
    path => request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/vehicles/:path*', '/reservations/:path*', '/calendar/:path*', '/maintenance/:path*', '/inspecciones/:path*', '/login']
}
