import { AppointmentResponseDto } from './appointment-response.dto';

export interface GeneratedSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  doctorId: string;
}

export interface GenerateSlotsParams {
  date: string;
  duration: number; // in minutes
  schedules: {
    doctorId: string;
    startTime: string;
    endTime: string;
    breakStartTime: string | null;
    breakEndTime: string | null;
  }[];
  appointments: AppointmentResponseDto[];
}

export interface WorkingScheduleMonthItem {
  date: string;
  doctorId: string;
  doctorName?: string;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
}
