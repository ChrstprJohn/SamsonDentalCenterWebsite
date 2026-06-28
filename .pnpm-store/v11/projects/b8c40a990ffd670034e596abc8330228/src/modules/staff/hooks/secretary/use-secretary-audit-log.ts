'use client';

import { useMemo, useState } from 'react';
import { useSecretary } from '../use-secretary';

export function useSecretaryAuditLog() {
  const { audits } = useSecretary();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filteredAudits = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return audits.filter((audit) => {
      const matchesSearch =
        audit.actorName.toLowerCase().includes(normalizedSearch) ||
        audit.targetName.toLowerCase().includes(normalizedSearch);
      const matchesAction = actionFilter ? audit.action === actionFilter : true;

      return matchesSearch && matchesAction;
    });
  }, [actionFilter, audits, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    actionFilter,
    setActionFilter,
    filteredAudits,
  };
}
