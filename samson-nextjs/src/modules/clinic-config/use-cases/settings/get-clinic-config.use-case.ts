import { ClinicConfigResponseDto } from '../../dtos/settings/get-clinic-config.dto';

export const DEFAULT_CONFIG: ClinicConfigResponseDto = {
  isBookingOpen: true,
  maintenanceMessage: null,
  maxReschedules: 1,
  clinicName: "Samson Dental",
  websiteLogoUrl: null,
  websiteLogoDarkUrl: null,
  emailLogoUrl: null,
  emailLogoDarkUrl: null,
  address: "123 Dental Way",
  mapUrl: null,
  phone: "555-0101",
  landline: null,
  email: "contact@samsondental.com",
  websiteUrl: null,
  whatsappUrl: null,
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
