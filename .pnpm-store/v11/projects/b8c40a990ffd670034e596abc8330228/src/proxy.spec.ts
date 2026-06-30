import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { proxy } from './proxy'
import { updateSession } from '@/shared/database/middleware'

// Mock the updateSession function using the exact alias matching the import
vi.mock('@/shared/database/middleware', () => ({
  updateSession: vi.fn(),
}))

describe('proxy Route Guards (Unit Test)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthenticated users to /login when accessing portals and retains tokens', async () => {
    // 1. Setup a dummy auth cookie to ensure the transfer loop is explicitly tested
    const mockResponse = new NextResponse()
    mockResponse.cookies.set('sb-access-token', 'fake-token-123', { httpOnly: true })

    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: mockResponse,
      user: null,
    })

    // 2. Simulate requesting a protected page
    const request = new NextRequest(new URL('http://localhost:3000/user/dashboard'))
    const result = await proxy(request)

    // 3. Assert: Verify it redirected to /login with a 307 status
    expect(result?.status).toBe(307)
    expect(result?.headers.get('location')).toBe('http://localhost:3000/login')

    // 4. Assert: Critical check ensuring refreshed auth cookies were not lost on redirect
    const redirectedCookie = result?.cookies.get('sb-access-token')
    expect(redirectedCookie).toBeDefined()
    expect(redirectedCookie?.value).toBe('fake-token-123')
  })

  it('redirects non-admin users to / when accessing /admin', async () => {
    const mockResponse = new NextResponse()
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: mockResponse,
      user: { user_metadata: { role: 'PATIENT' } } as any,
    })

    const request = new NextRequest(new URL('http://localhost:3000/admin/dashboard'))
    const result = await proxy(request)

    expect(result?.status).toBe(307)
    expect(result?.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('allows authorized Admin to pass through to /admin', async () => {
    const mockResponse = new NextResponse()
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: mockResponse,
      user: { user_metadata: { role: 'ADMIN' } } as any,
    })

    const request = new NextRequest(new URL('http://localhost:3000/admin/dashboard'))
    const result = await proxy(request)

    expect(result?.status).toBe(200)
    expect(result?.headers.get('location')).toBeNull()
  })

  it('allows Secretary to access /secretary but blocks them from /admin', async () => {
    const mockResponse = new NextResponse()
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: mockResponse,
      user: { user_metadata: { role: 'SECRETARY' } } as any,
    })

    // 1. Check valid route access for Secretary
    const validRequest = new NextRequest(new URL('http://localhost:3000/secretary/appointments'))
    const validResult = await proxy(validRequest)
    expect(validResult?.status).toBe(200)

    // 2. Check restricted admin route access for Secretary
    const invalidRequest = new NextRequest(new URL('http://localhost:3000/admin/dashboard'))
    const invalidResult = await proxy(invalidRequest)
    expect(invalidResult?.status).toBe(307)
    expect(invalidResult?.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('bypasses public paths without running access rule evaluations', async () => {
    const mockResponse = new NextResponse()
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: mockResponse,
      user: null, // No user, but should be allowed since it's the login page
    })

    const request = new NextRequest(new URL('http://localhost:3000/login'))
    const result = await proxy(request)

    expect(result?.status).toBe(200)
    expect(result?.headers.get('location')).toBeNull()
  })

  it('blocks DOCTOR, SECRETARY, and ADMIN from accessing /user/dashboard', async () => {
    const roles = ['DOCTOR', 'SECRETARY', 'ADMIN']
    for (const role of roles) {
      const mockResponse = new NextResponse()
      vi.mocked(updateSession).mockResolvedValue({
        supabaseResponse: mockResponse,
        user: { user_metadata: { role } } as any,
      })

      const request = new NextRequest(new URL('http://localhost:3000/user/dashboard'))
      const result = await proxy(request)

      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toBe('http://localhost:3000/')
    }
  })

  it('blocks PATIENT from accessing /doctor/dashboard or /secretary/appointments', async () => {
    const paths = ['/doctor/dashboard', '/secretary/appointments', '/admin/dashboard']
    for (const path of paths) {
      const mockResponse = new NextResponse()
      vi.mocked(updateSession).mockResolvedValue({
        supabaseResponse: mockResponse,
        user: { user_metadata: { role: 'PATIENT' } } as any,
      })

      const request = new NextRequest(new URL(`http://localhost:3000${path}`))
      const result = await proxy(request)

      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toBe('http://localhost:3000/')
    }
  })
})