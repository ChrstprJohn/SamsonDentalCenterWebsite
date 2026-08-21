import { SecretaryDocumentsView } from '@/modules/staff/views/secretary/secretary-documents-view';
import { getSecretaryDocumentsAction } from '@/modules/staff/actions/documents/upload-secretary-document.action';
import { authorizeRole } from '@/shared/auth/auth.util';

export default async function SecretaryDocumentsPage() {
  // 1. Authorize role first
  await authorizeRole('SECRETARY');

  // 2. Fetch documents
  const result = await getSecretaryDocumentsAction();
  const documents = 'data' in result ? result.data : [];

  return <SecretaryDocumentsView initialDocuments={documents} />;
}