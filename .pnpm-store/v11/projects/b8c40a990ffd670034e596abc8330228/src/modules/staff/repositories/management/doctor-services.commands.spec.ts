import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignDoctorServicesCommand } from './doctor-services.commands';

const mockFrom = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockInsert = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe('DoctorServicesCommands (Functional)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      delete: mockDelete,
      insert: mockInsert,
    });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('should successfully clear and assign new services', async () => {
    const assignDoctorServices = assignDoctorServicesCommand(mockSupabase);
    const result = await assignDoctorServices('doc-1', ['svc-1', 'svc-2']);

    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('doctor_services');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('doctor_id', 'doc-1');
    expect(mockInsert).toHaveBeenCalledWith([
      { doctor_id: 'doc-1', service_id: 'svc-1' },
      { doctor_id: 'doc-1', service_id: 'svc-2' },
    ]);
  });

  it('should only clear when service array is empty', async () => {
    const assignDoctorServices = assignDoctorServicesCommand(mockSupabase);
    const result = await assignDoctorServices('doc-1', []);

    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('doctor_services');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('doctor_id', 'doc-1');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should throw DomainError when delete fails', async () => {
    mockEq.mockResolvedValue({ error: { message: 'Delete failed' } });

    const assignDoctorServices = assignDoctorServicesCommand(mockSupabase);
    await expect(
      assignDoctorServices('doc-1', ['svc-1'])
    ).rejects.toThrow('Failed to clear existing doctor services: Delete failed');
  });

  it('should throw DomainError when insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'Insert failed' } });

    const assignDoctorServices = assignDoctorServicesCommand(mockSupabase);
    await expect(
      assignDoctorServices('doc-1', ['svc-1'])
    ).rejects.toThrow('Failed to assign new doctor services: Insert failed');
  });
});

