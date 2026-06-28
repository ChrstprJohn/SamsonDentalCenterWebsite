import { DomainError } from './domain.error';

export class NotFoundError extends DomainError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND_ERROR') {
    super(message, code);
  }
}
