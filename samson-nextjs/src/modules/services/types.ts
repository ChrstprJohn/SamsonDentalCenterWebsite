export type ServiceStatus = 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
export type ServiceTag = 'GENERAL' | 'SPECIALIZED';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number | null;
  serviceType: 'GENERAL' | 'SPECIALIZED';
  isActive: boolean;
  status: ServiceStatus;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
