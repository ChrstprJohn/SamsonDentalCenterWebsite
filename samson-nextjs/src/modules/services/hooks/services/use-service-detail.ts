'use client';

import { useState, useTransition } from 'react';
import { archiveServiceAction } from '../../actions/management/archive-service.action';
import { toggleServiceVisibilityAction } from '../../actions/management/toggle-service-visibility.action';
import type { Service } from '../../types';
import { useRouter } from 'next/navigation';

interface UseServiceDetailProps {
  service: Service | null;
  onSuccess?: () => void;
}

export function useServiceDetail({ service, onSuccess }: UseServiceDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleArchive = async () => {
    if (!service) return;
    setServerError(null);
    startTransition(async () => {
      const result = await archiveServiceAction(service.id);
      if (result.error) {
        setServerError(result.error);
      } else {
        setIsArchiveModalOpen(false);
        router.refresh();
        if (onSuccess) onSuccess();
      }
    });
  };

  const handleToggleVisibility = async () => {
    if (!service) return;
    setServerError(null);
    startTransition(async () => {
      const result = await toggleServiceVisibilityAction(service.id, service.isActive);
      if (result.error) {
        setServerError(result.error);
      } else {
        router.refresh();
        if (onSuccess) onSuccess();
      }
    });
  };

  return {
    isEditing,
    setIsEditing,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    isPending,
    serverError,
    handleArchive,
    handleToggleVisibility,
  };
}
