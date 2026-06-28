import { DomainError } from './domain.error';

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized operation', code: string = 'UNAUTHORIZED_ERROR') {
    super(message, code);
  }
}
