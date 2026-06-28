import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { updateSession } from './middleware'
import { createServerClient } from '@supabase/ssr'


// Make the createServerClient function become fake (mock)
vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(),
}))

describe('updateSession Helper (Unit Test)', () => {
    const mockGetUser = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        // Setup base Supabase mock client behavior
        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: mockGetUser,
            },
        } as any)
    })

    it('returns the user and middleware response when user is logged in', async () => {
        // 1. Mock Supabase returning an active authenticated user
        const mockUser = { id: 'user_123', email: 'test@samson.com', user_metadata: { role: 'PATIENT' } }
        mockGetUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        })

        // 2. Setup mock request
        const request = new NextRequest(new URL('http://localhost:3000/user/dashboard'))

        // 3. Execute target function
        const result = await updateSession(request)

        // 4. Assert: verify createServerClient was initialized and user was returned
        expect(createServerClient).toHaveBeenCalled()
        expect(mockGetUser).toHaveBeenCalled()
        expect(result.user).toEqual(mockUser)
        expect(result.supabaseResponse).toBeDefined()
    })

    it('returns user as null when session is invalid or expired', async () => {
        // 1. Mock Supabase session retrieval failing
        mockGetUser.mockResolvedValue({
            data: { user: null },
            error: new Error('Session expired'),
        })

        const request = new NextRequest(new URL('http://localhost:3000/user/dashboard'))
        const result = await updateSession(request)

        // 2. Assert: user is returned as null
        expect(result.user).toBeNull()
    })
})
