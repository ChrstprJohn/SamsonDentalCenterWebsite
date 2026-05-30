import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPatientProfileUseCase } from './get-patient-profile.use-case';
import { PatientProfileQueries } from '../repositories/patient-profile.queries';

describe('GetPatientProfileUseCase', () => {
  let useCase: GetPatientProfileUseCase;
  let mockQueries: any;

  beforeEach(() => {
    mockQueries = {
      getProfileById: vi.fn(),
    };

    useCase = new GetPatientProfileUseCase(
      mockQueries as unknown as PatientProfileQueries
    );
  });

  it('should successfully retrieve patient profile for a valid ID', async () => {
    const mockProfile = { id: 'patient-123', first_name: 'Jane', last_name: 'Smith' };
    mockQueries.getProfileById.mockResolvedValueOnce(mockProfile);

    const result = await useCase.execute('patient-123');

    expect(result).toEqual(mockProfile);
    expect(mockQueries.getProfileById).toHaveBeenCalledWith('patient-123');
  });

  it('should throw an error if patient ID is empty or missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'Patient ID is required to fetch patient profile.'
    );
    expect(mockQueries.getProfileById).not.toHaveBeenCalled();
  });
});
