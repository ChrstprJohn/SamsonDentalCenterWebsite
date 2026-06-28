import { describe, it, expect } from 'vitest'
import { UnauthorizedError } from './unauthorized.error'
import { DomainError } from './domain.error'

describe('UnauthorizedError', () => {
  it('should be an instance of DomainError', () => {
    const error = new UnauthorizedError()
    expect(error).toBeInstanceOf(DomainError)
  })

  it('should have the default "UNAUTHORIZED_ERROR" code', () => {
    const error = new UnauthorizedError()
    expect(error.code).toBe('UNAUTHORIZED_ERROR')
  })
})
