import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from './client' // Update with your actual path

// 1. Mock the dependency
vi.mock('@supabase/ssr', () => ({
    createBrowserClient: vi.fn(),
}))

describe('createClient Helper (Browser)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('initializes createBrowserClient with environment variables', () => {
        // 1. Execute
        createClient()

        // 2. Assert: verify it uses the public env variables
        expect(createBrowserClient).toHaveBeenCalledWith(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
    })
})