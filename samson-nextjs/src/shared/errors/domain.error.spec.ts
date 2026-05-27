import { describe, it, expect } from 'vitest'
import { DomainError } from './domain.error'

describe('Domain Error', () => {
  it('should create a DomainError with correct properties', () => {
    const error = new DomainError('Base error', 'BASE_CODE')
    expect(error.message).toBe('Base error')
    expect(error.code).toBe('BASE_CODE')
    expect(error).toBeInstanceOf(Error)
  })
})
