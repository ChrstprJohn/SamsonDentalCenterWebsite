import { describe, it, expect, beforeEach, vi } from 'vitest';
import { emailOutboxCommands } from './email-outbox.commands';
import { SupabaseClient } from '@supabase/supabase-js';

describe('EmailOutboxCommands', () => {
  let mockSupabase: any;
  let commands: ReturnType<typeof emailOutboxCommands>;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnValue({ eq: vi.fn() }),
      single: vi.fn(),
    };
    commands = emailOutboxCommands(mockSupabase as unknown as SupabaseClient);
  });

  it('should successfully queue an email', async () => {
    mockSupabase.insert.mockResolvedValue({ error: null });
    
    await expect(commands.queueEmail('test@test.com', 'Subject', 'signup_otp', {}))
      .resolves.not.toThrow();
      
    expect(mockSupabase.from).toHaveBeenCalledWith('email_outbox');
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      recipient: 'test@test.com',
      status: 'PENDING',
    }));
  });

  it('should throw an error when queuing fails', async () => {
    mockSupabase.insert.mockResolvedValue({ error: new Error('DB Error') });
    
    await expect(commands.queueEmail('test@test.com', 'Subject', 'signup_otp', {}))
      .rejects.toThrow('Failed to queue email: DB Error');
  });

  it('should mark email as sent', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.update.mockReturnValue({ eq: mockEq });
    
    await expect(commands.markAsSent('123')).resolves.not.toThrow();
    
    expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'SENT' }));
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });
});
