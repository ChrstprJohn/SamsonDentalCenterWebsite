import { Suspense } from 'react';
import { SecretaryFollowUpListView } from '@/modules/staff/views/secretary/secretary-follow-up-list-view';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
      <SecretaryFollowUpListView />
    </Suspense>
  );
}