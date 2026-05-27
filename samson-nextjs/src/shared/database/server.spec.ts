import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from './server'

// 1. Mock the dependencies
vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(),
}))

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}))

describe('createClient Helper', () => {
    const mockCookieStore = {
        getAll: vi.fn(),
        set: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    })

    it('initializes createServerClient with cookie store', async () => {
        // 1. Execute function
        await createClient()

        // 2. Assert: verify createServerClient was called
        expect(createServerClient).toHaveBeenCalledWith(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            expect.objectContaining({
                cookies: expect.any(Object),
            })
        )
    })

})