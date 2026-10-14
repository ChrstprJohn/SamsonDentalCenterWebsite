import { Suspense } from 'react';
import { SecretaryFollowUpListView } from '@/modules/staff/views/secretary/secretary-follow-up-list-view';
import { parseFollowUpFilters } from '@/modules/staff/views/secretary/sub-components/follow-up-filters';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFollowUpFilters(await searchParams);
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
      <SecretaryFollowUpListView filters={filters} />
    </Suspense>
  );
}
