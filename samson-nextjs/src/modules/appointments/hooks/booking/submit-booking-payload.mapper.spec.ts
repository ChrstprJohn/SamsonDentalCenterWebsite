/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import { createBookingPayload } from './submit-booking-payload.mapper';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

describe('createBookingPayload Mapper', () => {
  const mockService = {
    id: 'service-1',
    name: 'Teeth Cleaning',
    durationMinutes: 30,
    price: 100,
    isActive: true,
    serviceType: 'GENERAL',
  } as ServiceResponseDto;

  const mockSlot = {
    time: '10:00 AM',
    originalStartTime: '2025-01-01T10:00:00.000Z',
    doctorId: 'doc-1',
    doctorName: 'Dr. John',
    isPreferred: true,
  };

  it('should create a valid payload for a SELF booking', () => {
    const payload = createBookingPayload({
      selectedService: mockService,
      selectedSlot: mockSlot,
      selectedDate: '2025-01-01',
      patientType: 'SELF',
      selectedDependentId: null,
      newDependentData: null,
      userNote: 'Extra note',
    });

    expect(payload.serviceId).toBe('service-1');
    expect(payload.doctorId).toBe('doc-1');
    expect(payload.isPreferredDoctor).toBe(true);
    expect(payload.patientType).toBe('SELF');
    expect(payload.userNote).toBe('Extra note');
    expect(payload.dependentId).toBeUndefined();
    
    // Check time mappings
    expect(payload.startTime).toBe('2025-01-01T10:00:00.000Z');
    expect(payload.endTime).toBe('2025-01-01T10:30:00.000Z');
  });

  it('should map dependent fields for NEW_DEPENDENT', () => {
    const payload = createBookingPayload({
      selectedService: mockService,
      selectedSlot: mockSlot,
      selectedDate: '2025-01-01',
      patientType: 'NEW_DEPENDENT',
      selectedDependentId: null,
      newDependentData: {
        firstName: 'Jane',
        lastName: 'Doe',
        middleName: '',
        suffix: '',

        relationship: 'DAUGHTER',
        birthday: '2015-01-01',
      },
      userNote: '',
    });

    expect(payload.patientType).toBe('NEW_DEPENDENT');
    expect(payload.dependentFirstName).toBe('Jane');
    expect(payload.dependentLastName).toBe('Doe');
  });

  it('should map dependent ID for EXISTING_DEPENDENT', () => {
    const payload = createBookingPayload({
      selectedService: mockService,
      selectedSlot: mockSlot,
      selectedDate: '2025-01-01',
      patientType: 'EXISTING_DEPENDENT',
      selectedDependentId: 'dep-1',
      newDependentData: null,
      userNote: '',
    });

    expect(payload.patientType).toBe('EXISTING_DEPENDENT');
    expect(payload.dependentId).toBe('dep-1');
    expect(payload.dependentFirstName).toBeUndefined();
  });
});
