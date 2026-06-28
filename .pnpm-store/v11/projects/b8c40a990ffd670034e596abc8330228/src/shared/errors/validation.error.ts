import { DomainError } from './domain.error';

export class ValidationError extends DomainError {
  constructor(message: string = 'Validation failed', code: string = 'VALIDATION_ERROR') {
    super(message, code);
  }
}