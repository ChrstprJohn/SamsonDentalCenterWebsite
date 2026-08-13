import { SecretaryPendingRequestsViewV2 } from '@/modules/staff/views/secretary/secretary-pending-requests-view-v2';

export default async function Page({ searchParams }: { searchParams?: Promise<{ id?: string }> | { id?: string } }) {
  const sp = (await searchParams) ?? {};
  const deepLinkId = typeof sp.id === 'string' ? sp.id : null;
  return <SecretaryPendingRequestsViewV2 deepLinkId={deepLinkId} />;
}
