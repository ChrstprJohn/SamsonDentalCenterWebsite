import 'server-only';

export const SmsService = {
  /**
   * Mock utility for sending outbound SMS notifications.
   * In production, this would integrate with Twilio or another SMS gateway API.
   */
  async sendSms(to: string, message: string): Promise<{ success: boolean; id: string }> {
    console.log(`[SMS DISPATCH] To: ${to} | Message: "${message}"`);
    return {
      success: true,
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  },
};
