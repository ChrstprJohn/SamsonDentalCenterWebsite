import { describe, it, expect } from 'vitest'
import { NotFoundError } from './not-found.error'
import { DomainError } from './domain.error'

describe('NotFoundError', () => {
  it('should be an instance of DomainError', () => {
    const error = new NotFoundError()
    expect(error).toBeInstanceOf(DomainError)
  })

  it('should have the default "NOT_FOUND_ERROR" code', () => {
    const error = new NotFoundError()
    expect(error.code).toBe('NOT_FOUND_ERROR')
  })

  it('should accept a custom message', () => {
    const message = 'Patient not found'
    const error = new NotFoundError(message)
    expect(error.message).toBe(message)
  })
})
