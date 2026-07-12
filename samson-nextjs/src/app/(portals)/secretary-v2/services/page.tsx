import React from 'react';
import { getServicesQuery } from '@/modules/services/exports';
import { ServicesView } from '@/modules/services/views/services-view';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';

export default async function SecretaryServicesPage() {
  // 1. Authorize role first
  await authorizeRole('SECRETARY');

  // 2. Fetch data via query closure
  const supabase = await createClient();
  const getServices = getServicesQuery(supabase);
  const initialServices = await getServices(true); // get both active and inactive for management

  return (
    <div className="py-8 px-6">
      <ServicesView initialServices={initialServices as any} />
    </div>
  );
}
