import React from 'react';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getNoShowReasonsQuery } from '@/modules/no-show-reasons/queries/get-no-show-reasons.query';
import { NoShowReasonsAdminView } from '@/modules/no-show-reasons/components/no-show-reasons-admin-view';

export const dynamic = 'force-dynamic';

export default async function SecretaryNoShowReasonsPage() {
  await authorizeRole('SECRETARY');

  const supabase = await createClient();
  const getNoShowReasons = getNoShowReasonsQuery(supabase);
  const reasons = await getNoShowReasons();

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">No-Show Reasons</h1>
        <p className="text-xs text-text-muted">Reasons collected from patients via the missed-appointment link.</p>
      </div>
      <NoShowReasonsAdminView initialReasons={reasons} />
    </div>
  );
}