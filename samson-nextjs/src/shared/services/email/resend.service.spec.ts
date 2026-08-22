import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResendService } from './resend.service';
import { createAdminClient } from '@/shared/database/server';
import { getClinicConfigUseCase } from '@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/server');
vi.mock('@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case');

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe('ResendService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: 're_test_key_123' };
    delete process.env.RESEND_SENDER_EMAIL;
    delete process.env.RESEND_SENDER_NAME;
    delete process.env.RESEND_BCC_EMAIL;
    delete process.env.CLINIC_BUSINESS_EMAIL;

    mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

    vi.mocked(createAdminClient).mockResolvedValue({} as any);
    vi.mocked(getClinicConfigUseCase).mockReturnValue(async () => ({
      clinicName: 'Samson Dental Center',
      email: 'info@samsondentalcenter.com',
      phone: '(02) 8123-4567',
      address: 'Quezon City',
      websiteUrl: 'https://samsondentalcenter-website.chrbuilds.dev',
      isBookingOpen: true,
      maintenanceMessage: null,
      maxReschedules: 2,
      websiteLogoUrl: null,
      websiteLogoDarkUrl: null,
      emailLogoUrl: null,
      emailLogoDarkUrl: null,
      mapUrl: null,
      landline: null,
      whatsappUrl: null,
      operatingHours: {} as any,
      allowSameDayBooking: true,
      calendarRenderDays: 30,
      socialLinks: [],
    }));
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Sender Address (Custom Domain)', () => {
    it('sends from default custom domain address when no env override is present', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Samson Dental Center <noreply@samsondentalcenter-website.chrbuilds.dev>',
        })
      );
    });

    it('respects RESEND_SENDER_EMAIL and RESEND_SENDER_NAME environment overrides', async () => {
      process.env.RESEND_SENDER_EMAIL = 'custom@customdomain.com';
      process.env.RESEND_SENDER_NAME = 'Custom Clinic';

      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Custom Clinic <custom@customdomain.com>',
        })
      );
    });

    it('allows overriding from and senderName via options parameter', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
        from: 'billing@samsondentalcenter-website.chrbuilds.dev',
        senderName: 'Samson Billing',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Samson Billing <billing@samsondentalcenter-website.chrbuilds.dev>',
        })
      );
    });
  });

  describe('Dynamic Reply-To Target', () => {
    it('sets replyTo target to dynamic business email from clinic config', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Appointment Info',
        html: '<p>Details</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: ['info@samsondentalcenter.com'],
        })
      );
    });

    it('allows overriding replyTo via options', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Appointment Info',
        html: '<p>Details</p>',
        replyTo: 'support@samsondentalcenter.com',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: ['support@samsondentalcenter.com'],
        })
      );
    });
  });

  describe('Dynamic BCC Business Copy', () => {
    it('automatically includes dynamic business email in BCC for transactional emails', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Booking Confirmation',
        html: '<p>Confirmed</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          bcc: ['info@samsondentalcenter.com'],
        })
      );
    });

    it('does not duplicate BCC if the primary recipient is the business email itself', async () => {
      await ResendService.sendEmail({
        to: 'info@samsondentalcenter.com',
        subject: 'Admin Notification',
        html: '<p>Hello Admin</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.not.objectContaining({
          bcc: expect.anything(),
        })
      );
    });

    it('allows disabling BCC by passing bcc: false or bcc: null', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Confidential Note',
        html: '<p>Private</p>',
        bcc: false,
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.not.objectContaining({
          bcc: expect.anything(),
        })
      );
    });

    it('allows overriding BCC with custom address array', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Note',
        html: '<p>Message</p>',
        bcc: ['archive@samsondentalcenter.com', 'manager@samsondentalcenter.com'],
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          bcc: ['archive@samsondentalcenter.com', 'manager@samsondentalcenter.com'],
        })
      );
    });
  });

  describe('Threading Headers (In-Reply-To & References)', () => {
    it('sets In-Reply-To and References headers when inReplyTo and references options are provided', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Re: Follow up',
        html: '<p>Message</p>',
        inReplyTo: 'msg-root-123@samsondentalcenter-website.chrbuilds.dev',
        references: ['msg-root-123@samsondentalcenter-website.chrbuilds.dev', 'msg-2@samsondentalcenter-website.chrbuilds.dev'],
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'In-Reply-To': '<msg-root-123@samsondentalcenter-website.chrbuilds.dev>',
            'References': '<msg-root-123@samsondentalcenter-website.chrbuilds.dev> <msg-2@samsondentalcenter-website.chrbuilds.dev>',
          },
        })
      );
    });

    it('generates threading headers from threadId option', async () => {
      await ResendService.sendEmail({
        to: 'patient@example.com',
        subject: 'Chat Thread',
        html: '<p>Message</p>',
        threadId: 'appt-uuid-999',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'In-Reply-To': '<thread-appt-uuid-999@samsondentalcenter-website.chrbuilds.dev>',
            'References': '<thread-appt-uuid-999@samsondentalcenter-website.chrbuilds.dev>',
          },
        })
      );
    });

    it('auto-threads appointment follow-up emails (appointment_confirmed) to the root appointment thread', async () => {
      await ResendService.sendTemplatedEmail(
        'patient@example.com',
        'Appointment Confirmed',
        'appointment_confirmed',
        {
          patientName: 'John Doe',
          serviceName: 'Cleaning',
          doctorName: 'Dr. Smith',
          dateStr: 'Aug 25, 2026',
          timeRangeStr: '10:00 AM - 11:00 AM',
          appointmentId: 'appt-12345',
        }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'In-Reply-To': '<appointment-appt-12345@samsondentalcenter-website.chrbuilds.dev>',
            'References': '<appointment-appt-12345@samsondentalcenter-website.chrbuilds.dev>',
          },
        })
      );
    });

    it('does not set In-Reply-To for root appointment request emails', async () => {
      await ResendService.sendTemplatedEmail(
        'patient@example.com',
        'Appointment Request Received',
        'appointment_request_received',
        {
          accountHolderName: 'John Doe',
          patientName: 'John Doe',
          serviceName: 'Cleaning',
          dateStr: 'Aug 25, 2026',
          appointmentId: 'appt-12345',
        }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['patient@example.com'],
          bcc: ['info@samsondentalcenter.com'],
          replyTo: ['info@samsondentalcenter.com'],
        })
      );
      // Ensure headers does not contain In-Reply-To for root email
      const callArg = mockSend.mock.calls[0][0];
      expect(callArg.headers?.['In-Reply-To']).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('throws error when RESEND_API_KEY is missing', async () => {
      delete process.env.RESEND_API_KEY;

      await expect(
        ResendService.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: 'test',
        })
      ).rejects.toThrow('RESEND_API_KEY is not configured');
    });

    it('throws when Resend API returns an error', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Domain verification required', name: 'validation_error' },
      });

      await expect(
        ResendService.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: 'test',
        })
      ).rejects.toThrow('Resend API Error: Domain verification required');
    });
  });
});
