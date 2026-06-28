'use client';

import { useMemo, useState } from 'react';
import { useSecretary } from '../use-secretary';

export function useSecretaryEmailLog() {
  const { emails } = useSecretary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const selectedEmail = useMemo(
    () => emails.find((email) => email.id === selectedEmailId) ?? null,
    [emails, selectedEmailId]
  );

  const filteredEmails = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return emails.filter(
      (email) =>
        email.recipient.toLowerCase().includes(normalizedSearch) ||
        email.subject.toLowerCase().includes(normalizedSearch)
    );
  }, [emails, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    selectedEmailId,
    setSelectedEmailId,
    selectedEmail,
    filteredEmails,
  };
}
