import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function SecretarySchedulesPage() {
  redirect('/secretary/clinic-settings');
}
