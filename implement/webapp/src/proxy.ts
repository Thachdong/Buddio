import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = '__session' // = shared/server/auth SESSION_COOKIE (proxy không import server-only)

/**
 * Chỉ redirect lạc quan theo việc CÓ cookie hay không — không verify, không phải ranh giới bảo mật.
 * Kiểm thật ở guard (tabs)/(full) và ở từng action / query.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/rooms/:path*', '/friends/:path*', '/notifications/:path*', '/settings/:path*'],
}
