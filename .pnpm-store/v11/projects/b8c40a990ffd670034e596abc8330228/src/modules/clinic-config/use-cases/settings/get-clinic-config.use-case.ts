import { ClinicConfigResponseDto } from '../../dtos/settings/get-clinic-config.dto';

const DEFAULT_CONFIG: ClinicConfigResponseDto = {
  isBookingOpen: true,
  maintenanceMessage: null,
  maxReschedules: 1,
  clinicName: "Samson Dental",
  address: "123 Dental Way",
  phone: "555-0101",
  email: "contact@samsondental.com",
  operatingHours: {
    monday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
    tuesday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
    wednesday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
    thursday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
    friday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
    saturday: { isOpen: false, openTime: null, closeTime: null },
    sunday: { isOpen: false, openTime: null, closeTime: null },
  },
  allowSameDayBooking: true,
  calendarRenderDays: 30,
  socialLinks: [],
};

export const getClinicConfigUseCase = (
  getClinicConfig: () => Promise<ClinicConfigResponseDto | null>
) => {
  return async (): Promise<ClinicConfigResponseDto> => {
    const config = await getClinicConfig();
    return config || DEFAULT_CONFIG;
  };
};
