import { describe, it, expect } from 'vitest'
import { ValidationError } from './validation.error'
import { DomainError } from './domain.error'

describe('ValidationError', () => {
  it('should be an instance of DomainError', () => {
    const error = new ValidationError()
    expect(error).toBeInstanceOf(DomainError)
  })

  it('should have the default "VALIDATION_ERROR" code', () => {
    const error = new ValidationError()
    expect(error.code).toBe('VALIDATION_ERROR')
  })

  it('should accept a custom message', () => {
    const message = 'Invalid phone number format'
    const error = new ValidationError(message)
    expect(error.message).toBe(message)
  })
})