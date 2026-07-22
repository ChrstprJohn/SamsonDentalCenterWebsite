import { DomainError } from '@/shared/errors';
import { SendMessageDto } from '../../dtos/chat/send-message.dto';
import { MessageResponseDto } from '../../dtos/chat/message-response.dto';

export const sendMessageUseCase = (
    getAppointmentStatus: (appointmentId: string) => Promise<{ status: string; patientId: string | null } | null>,
    insertMessage: (data: SendMessageDto) => Promise<MessageResponseDto>
) => {
    return async (data: SendMessageDto): Promise<MessageResponseDto> => {
        const appt = await getAppointmentStatus(data.appointmentId);
        if (!appt) {
            throw new DomainError('Appointment not found', 'NOT_FOUND');
        }

        const { status } = appt;
        const activeStatuses = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
        
        if (!activeStatuses.includes(status)) {
            throw new DomainError(
                `This chat thread is not active because the appointment is ${status}.`,
                'FORBIDDEN'
            );
        }

        return await insertMessage(data);
    };
};
