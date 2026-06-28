import { DomainError } from '@/shared/errors';

interface RequestPasswordResetDeps {
  requestPasswordResetCommand: (email: string) => Promise<void>;
  triggerBackgroundWorkers: () => void;
}

export const requestPasswordResetUseCase = (deps: RequestPasswordResetDeps) => {
  return async (email: string) => {
    try {
      await deps.requestPasswordResetCommand(email);
      // Business Rule: Emit event to outbox, trigger background worker to dispatch
      deps.triggerBackgroundWorkers();
    } catch (error: any) {
      throw new DomainError(error.message || 'Failed to request password reset');
    }
  };
};
