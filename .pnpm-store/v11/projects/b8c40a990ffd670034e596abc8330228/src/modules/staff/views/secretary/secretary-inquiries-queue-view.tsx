'use client';

import { useSecretaryInquiriesQueue } from '../../hooks/secretary/use-secretary-inquiries-queue';
import { InquiryDetailPane } from './sub-components/inquiry-detail-pane';
import { InquiriesList } from './sub-components/inquiries-list';
import { InquiryToast } from './sub-components/inquiry-toast';

export function SecretaryInquiriesQueueView() {
  const view = useSecretaryInquiriesQueue();

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Inquiries Queue</h1>
        <p className="text-xs text-text-muted">Manage guest inquiries. Convert them directly into appointments or drop/archive the records.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        <InquiriesList
          inquiries={view.inquiries}
          selectedInquiryId={view.selectedInquiryId}
          isLoading={view.isLoadingInquiries}
          error={view.inquiriesError}
          onRetry={view.loadInquiries}
          onSelect={view.selectInquiry}
        />
        <InquiryDetailPane view={view} />
      </div>
      <InquiryToast toast={view.toast} />
    </div>
  );
}
