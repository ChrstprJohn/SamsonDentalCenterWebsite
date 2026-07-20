import { describe, it, expect } from 'vitest';
import { generateAvailableSlotsForDay } from './availability.utils';

describe('generateAvailableSlotsForDay', () => {
  const doctorId = '22222222-2222-2222-8222-222222222222';

  it('should generate slots correctly with standard doctor working hours', () => {
    const params = {
      date: '2024-12-25',
      duration: 30,
      schedules: [
        {
          doctorId,
          startTime: '09:00:00',
          endTime: '11:00:00',
          breakStartTime: null,
          breakEndTime: null,
        },
      ],
      appointments: [],
    };

    const slots = generateAvailableSlotsForDay(params);

    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({
      startTime: '09:00',
      endTime: '09:30',
      doctorId,
    });
    expect(slots[3]).toEqual({
      startTime: '10:30',
      endTime: '11:00',
      doctorId,
    });
  });

  it('should exclude slots during lunch breaks', () => {
    const params = {
      date: '2024-12-25',
      duration: 30,
      schedules: [
        {
          doctorId,
          startTime: '09:00:00',
          endTime: '11:00:00',
          breakStartTime: '10:00:00',
          breakEndTime: '10:30:00',
        },
      ],
      appointments: [],
    };

    const slots = generateAvailableSlotsForDay(params);

    expect(slots).toHaveLength(3);
    expect(slots.map((s) => s.startTime)).not.toContain('10:00');
  });

  it('should exclude slots that overlap with active appointments', () => {
    const params = {
      date: '2024-12-25',
      duration: 30,
      schedules: [
        {
          doctorId,
          startTime: '09:00:00',
          endTime: '11:00:00',
          breakStartTime: null,
          breakEndTime: null,
        },
      ],
      appointments: [
        {
          id: 'appt-1',
          doctorId,
          startTime: '09:30',
          endTime: '10:00',
          status: 'APPROVED',
          date: '2024-12-25',
        },
      ],
    };

    const slots = generateAvailableSlotsForDay(params);

    expect(slots).toHaveLength(3);
    expect(slots.map((s) => s.startTime)).not.toContain('09:30');
  });
});
