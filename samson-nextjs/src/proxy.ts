// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/shared/database/middleware'

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['/admin', '/secretary', '/user'],
  SECRETARY: ['/secretary', '/user'],
  PATIENT: ['/user'],
};

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || !pathname.match(/\/(admin|secretary|user)/)) {
    return supabaseResponse
  }

  let redirectUrl: URL | null = null;

  // 1. Unauthenticated check
  if (!user) {
    redirectUrl = new URL('/login', request.url)
  } else {
    // 2. RBAC check
    const userRole = user.user_metadata?.role || 'PATIENT'
    const allowedPaths = ROLE_PERMISSIONS[userRole] || []
    
    const isAuthorized = allowedPaths.some(path => pathname.startsWith(path))

    if (!isAuthorized) {
      redirectUrl = new URL('/', request.url)
    }
  }

  // Handle Redirects & Cookie Transfer
  if (redirectUrl) {
    const redirectResponse = NextResponse.redirect(redirectUrl)
    
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      })
    })
    
    return redirectResponse
  }

  return supabaseResponse
}