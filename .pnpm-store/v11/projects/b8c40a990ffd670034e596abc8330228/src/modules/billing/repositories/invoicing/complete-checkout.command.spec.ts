import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { completeCheckoutCommand } from './complete-checkout.command';

const mockRpc = vi.fn();
const mockSupabase = {
  rpc: mockRpc,
} as unknown as SupabaseClient;

describe('completeCheckoutCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully completes checkout', async () => {
    const mockInvoice = {
      id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      appointment_id: '1a95a63c-333e-4b68-98e3-82bdf1a07bd2',
      amount: 850,
      status: 'FINALIZED',
      payment_method: 'CARD',
      discount_applied: 50,
    };

    mockRpc.mockResolvedValue({
      data: mockInvoice,
      error: null,
    });

    const command = completeCheckoutCommand(mockSupabase);
    const result = await command(
      {
        invoiceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        paymentMethod: 'CARD',
        discountPercent: 10,
        additionalItems: [
          {
            serviceId: 'ea95a63c-333e-4b68-98e3-82bdf1a07bd3',
            description: 'Whitening Kit',
            unitPrice: 200,
            quantity: 1,
          }
        ],
      },
      'actor-uuid-123'
    );

    expect(mockRpc).toHaveBeenCalledWith('complete_checkout_transaction', {
      p_invoice_id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      p_payment_method: 'CARD',
      p_discount_percent: 10,
      p_additional_items: [
        {
          serviceId: 'ea95a63c-333e-4b68-98e3-82bdf1a07bd3',
          description: 'Whitening Kit',
          unitPrice: 200,
          quantity: 1,
        }
      ],
      p_actor_id: 'actor-uuid-123',
    });

    expect(result.status).toBe('FINALIZED');
    expect(result.paymentMethod).toBe('CARD');
  });

  it('throws DomainError when database RPC fails', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'Database RLS or function constraint violation' },
    });

    const command = completeCheckoutCommand(mockSupabase);
    await expect(
      command(
        {
          invoiceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
          paymentMethod: 'CARD',
        },
        'actor-uuid-123'
      )
    ).rejects.toThrow('Failed to complete checkout transaction: Database RLS or function constraint violation');
  });
});
