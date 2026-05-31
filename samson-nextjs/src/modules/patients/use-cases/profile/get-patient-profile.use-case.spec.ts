import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientProfileUseCase } from './get-patient-profile.use-case';

describe('GetPatientProfileUseCase (Functional)', () => {
  let mockGetProfileById: any;

  beforeEach(() => {
    mockGetProfileById = vi.fn();
  });

  it('should successfully retrieve patient profile for a valid ID', async () => {
    const mockProfile = { id: 'patient-123', firstName: 'Jane', lastName: 'Smith' };
    mockGetProfileById.mockResolvedValueOnce(mockProfile);

    const execute = getPatientProfileUseCase(mockGetProfileById);
    const result = await execute('patient-123');

    expect(result).toEqual(mockProfile);
    expect(mockGetProfileById).toHaveBeenCalledWith('patient-123');
  });

  it('should throw an error if patient ID is empty or missing', async () => {
    const execute = getPatientProfileUseCase(mockGetProfileById);
    await expect(execute('')).rejects.toThrow(
      'Patient ID is required to fetch patient profile.'
    );
    expect(mockGetProfileById).not.toHaveBeenCalled();
  });
});

