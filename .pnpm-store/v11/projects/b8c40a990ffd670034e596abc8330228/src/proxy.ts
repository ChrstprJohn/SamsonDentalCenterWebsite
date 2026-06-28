import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/shared/database/middleware'

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['/admin', '/secretary', '/user'],
  SECRETARY: ['/secretary', '/user'],
  DOCTOR: ['/doctor', '/user'],
  PATIENT: ['/user'],
};

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // ponytail: searchParams 'staff' fallback allows easy local testing on localhost:3000
  const isStaffDomain = 
    host.startsWith('staff-') || 
    host.includes('staff-samsondental.com') || 
    request.nextUrl.searchParams.has('staff')

  // 1. Separate login pages routing under the hood
  if (pathname === '/login') {
    if (isStaffDomain) {
      return NextResponse.rewrite(new URL('/auth/staff-login', request.url))
    }
    return NextResponse.rewrite(new URL('/auth/login', request.url))
  }

  // Skip other checks if public/marketing routes
  if (!pathname.match(/\/(admin|secretary|user|doctor)/)) {
    return supabaseResponse
  }

  let redirectUrl: URL | null = null;

  // 2. Unauthenticated check
  if (!user) {
    redirectUrl = new URL('/login', request.url)
  } else if (
    user.user_metadata?.status === 'FORCE_PASSWORD_CHANGE' &&
    pathname !== '/auth/force-password-change'
  ) {
    redirectUrl = new URL('/auth/force-password-change', request.url)
  } else {
    // 3. RBAC check
    const userRole = user.user_metadata?.role || 'PATIENT'
    const allowedPaths = ROLE_PERMISSIONS[userRole] || []
    const isAuthorized = allowedPaths.some(path => pathname.startsWith(path))

    if (!isAuthorized) {
      redirectUrl = new URL('/', request.url)
    } else {
      // 4. Domain cross-access protection (redirect incorrect roles)
      // ponytail: only enforce cross-domain redirects on production or simulated domains
      const isProdOrSimulated = 
        host.startsWith('staff-') || 
        host.includes('samsondental.com') || 
        host.includes('samsondental.local')

      if (isProdOrSimulated) {
        const isStaffRole = ['ADMIN', 'SECRETARY', 'DOCTOR'].includes(userRole)

        if (isStaffRole && !isStaffDomain) {
          // Staff on patient domain -> redirect to staff subdomain
          const targetHost = host.includes('localhost') ? host : `staff-${host}`
          redirectUrl = new URL('/auth/staff-login', `${request.nextUrl.protocol}//${targetHost}`)
        } else if (userRole === 'PATIENT' && isStaffDomain) {
          // Patient on staff domain -> redirect to apex domain
          const targetHost = host.replace(/^staff-/, '')
          redirectUrl = new URL('/auth/login', `${request.nextUrl.protocol}//${targetHost}`)
        }
      }
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

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files/assets (css, js, images, fonts)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:css|js|webp|png|jpg|jpeg|gif|svg|woff2?|ico|csv|json)$).*)',
  ],
}