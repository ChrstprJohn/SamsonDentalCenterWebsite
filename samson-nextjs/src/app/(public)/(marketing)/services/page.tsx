import { redirect } from 'next/navigation';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const config = await getClinicConfigAction();
  if (config?.data && !config.data.isBookingOpen) {
    redirect('/#services');
  }
  redirect(category ? `/book?category=${encodeURIComponent(category)}` : '/book');
}
