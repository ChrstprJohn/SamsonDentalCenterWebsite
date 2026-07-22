import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onManualBookingSmsSubscriber } from './on-manual-booking-sms.subscriber';
import { SmsService } from '@/shared/services/sms/sms.service';
import { createAdminClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/services/sms/sms.service');
vi.mock('@/shared/database/server');

describe('onManualBookingSmsSubscriber', () => {
  const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
  const mockSupabase = { from: vi.fn(() => ({ update: mockUpdate })) } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase);
  });

  it('sends SMS confirmation to the patient phone number with appointment details', async () => {
    const payload = {
      appointmentId: 'appt-1',
      patientName: 'John Doe',
      phoneNumber: '0917-111-2222',
      date: '2026-07-20',
      startTime: '10:00',
      serviceName: 'Teeth Whitening',
    };

    vi.mocked(SmsService.sendSms).mockResolvedValueOnce({ success: true, id: 'sms-1' });

    await onManualBookingSmsSubscriber.handle(payload);

    expect(SmsService.sendSms).toHaveBeenCalledWith(
      '0917-111-2222',
      expect.stringContaining('Samson Dental: Appt confirmed')
    );
    expect(SmsService.sendSms).toHaveBeenCalledWith(
      '0917-111-2222',
      expect.stringContaining('10:00 AM')
    );
  });
});
