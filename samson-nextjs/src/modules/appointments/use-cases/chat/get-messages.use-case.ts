import { DomainError } from '@/shared/errors';
import { MessageResponseDto } from '../../dtos/chat/message-response.dto';

export const getMessagesUseCase = (
    getAppointmentStatus: (appointmentId: string) => Promise<{ status: string; patientId: string | null } | null>,
    getMessages: (appointmentId: string) => Promise<MessageResponseDto[]>
) => {
    return async (
        appointmentId: string,
        currentUser: { id: string; role: string } | null,
        chatToken?: string
    ): Promise<MessageResponseDto[]> => {
        const appt = await getAppointmentStatus(appointmentId);
        if (!appt) {
            throw new DomainError('Appointment not found', 'NOT_FOUND');
        }

        if (currentUser) {
            const isStaff = ['SECRETARY', 'ADMIN', 'DOCTOR'].includes(currentUser.role);
            const isOwner = appt.patientId === currentUser.id;
            if (!isStaff && !isOwner) {
                throw new DomainError('Unauthorized to view this chat thread', 'FORBIDDEN');
            }
        } else {
            if (!chatToken) {
                throw new DomainError('Missing credentials to access this thread', 'UNAUTHORIZED');
            }
        }

        return await getMessages(appointmentId);
    };
};
