import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TreatmentCommands } from './treatment.commands';

const mockFrom = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe('TreatmentCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  it('updates appointment to TREATMENT_RENDERED with clinical notes', async () => {
    const commands = new TreatmentCommands(mockSupabase);
    const result = await commands.submitTreatment('appt-123', 'Notes here');

    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('appointments');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'TREATMENT_RENDERED',
        clinical_notes: 'Notes here',
      })
    );
  });

  it('throws DomainError when database update fails', async () => {
    mockEq.mockResolvedValue({ error: { message: 'DB fail' } });

    const commands = new TreatmentCommands(mockSupabase);
    await expect(
      commands.submitTreatment('appt-123', 'Notes')
    ).rejects.toThrow('Failed to submit treatment status: DB fail');
  });
});
