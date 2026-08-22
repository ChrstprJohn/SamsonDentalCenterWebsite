import React from 'react';
import { ServicesPageView } from '@/modules/patients/views/services-page-view';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';

export const metadata = {
  title: 'Our Services | Samson Dental Center',
  description: 'Explore the full range of dental services offered at Samson Dental Center — from consultations and diagnostics to orthodontics, implants, cosmetic dentistry, and more. Book your appointment today.',
};

export default async function ServicesPage() {
  const { data: dbServices } = await getServicesAction(false);
  return <ServicesPageView dbServices={dbServices ?? []} />;
}
