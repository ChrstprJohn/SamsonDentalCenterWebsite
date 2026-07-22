import { DomainError } from '@/shared/errors';

export const markMessagesAsReadUseCase = (
    markAsRead: (appointmentId: string, senderRoleToMarkRead: 'PATIENT' | 'STAFF') => Promise<void>
) => {
    return async (appointmentId: string, readerRole: 'PATIENT' | 'STAFF'): Promise<void> => {
        const senderRoleToMarkRead = readerRole === 'STAFF' ? 'PATIENT' : 'STAFF';
        await markAsRead(appointmentId, senderRoleToMarkRead);
    };
};
