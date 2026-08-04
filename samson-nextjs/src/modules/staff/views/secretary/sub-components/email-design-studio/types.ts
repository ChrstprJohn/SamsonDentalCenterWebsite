export type EmailDesignId =
  | 'appointment-confirmed'
  | 'reminder-24h'
  | 'reminder-48h'
  | 'cancelled'
  | 'rescheduled'
  | 'staff-reply'
  | 'post-care'
  | 'booking-request-received'
  | 'request-rejected';

export type PreviewMode = 'desktop' | 'mobile';

export type SampleDataField =
  | 'patientName'
  | 'serviceName'
  | 'doctorName'
  | 'dateStr'
  | 'timeRangeStr'
  | 'appointmentId'
  | 'baseUrl'
  | 'rejectionReason'
  | 'cancellationReason';

export interface SampleData {
  patientName: string;
  serviceName: string;
  doctorName: string;
  dateStr: string;
  timeRangeStr: string;
  appointmentId: string;
  baseUrl: string;
  rejectionReason: string;
  cancellationReason: string;
}

export interface DesignTokens {
  primary: string;
  accent: string;
  canvas: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  buttonText: string;
  radius: number;
  density: number;
  fontFamily: string;
}

export interface DraftCopy {
  subject: string;
  preheader: string;
  headerLabel: string;
  headline: string;
  intro: string;
  ctaLabel: string;
  primaryInstruction: string;
  secondaryInstruction: string;
  footerText: string;
  showSummary: boolean;
  showCta: boolean;
  showInstructions: boolean;
  showFooter: boolean;
}

export interface EmailDesignDefinition {
  id: EmailDesignId;
  label: string;
  category: string;
  description: string;
  event: string;
  fields: SampleDataField[];
}
