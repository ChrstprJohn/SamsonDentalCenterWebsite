"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { FileText, Upload, Trash2, Loader2, CheckCircle, AlertCircle, FileQuestion, ExternalLink, Search, X, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/feedback/toast-container';
import { uploadSecretaryDocumentAction, deleteSecretaryDocumentAction, getSecretaryDocumentsAction, getSecretaryDocumentUrlAction } from '@/modules/staff/actions/documents/upload-secretary-document.action';

interface SecretaryDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  extracted_text: string | null;
  error_message: string | null;
  upload_status: string;
  created_at: string;
  uploaded_by: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SecretaryDocumentsView({ initialDocuments = [] }: { initialDocuments?: SecretaryDocument[] }) {
  const [documents, setDocuments] = useState<SecretaryDocument[]>(initialDocuments);
  const [isLoading, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      startTransition(async () => {
        const result = await getSecretaryDocumentsAction();
        if ('data' in result) {
          setDocuments(result.data);
        } else {
          addToast(result.error, 'error');
        }
      });
    };
    fetchDocuments();
  }, [addToast]);

  const selectPdfFile = (file: File | undefined) => {
    if (file) {
      if (file.type !== 'application/pdf') {
        addToast('Only PDF files are allowed', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        addToast('File size exceeds 10MB limit', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectPdfFile(event.target.files?.[0]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!isUploading && !isLoading) {
      event.dataTransfer.dropEffect = 'copy';
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!isUploading && !isLoading) {
      selectPdfFile(event.dataTransfer.files?.[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      addToast('Please select a PDF file', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    const result = await uploadSecretaryDocumentAction(formData);
    
    if ('data' in result) {
      addToast(`${result.data.fileName} uploaded and processed successfully`, 'success');
      setSelectedFile(null);
      // Refresh documents list
      const fetchResult = await getSecretaryDocumentsAction();
      if ('data' in fetchResult) {
        setDocuments(fetchResult.data);
      }
    } else {
      addToast(result.error, 'error');
    }
    setIsUploading(false);
  };

  const handleDelete = async (document: SecretaryDocument) => {
    if (!confirm(`Delete "${document.file_name}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteSecretaryDocumentAction(document.id);
      if ('success' in result) {
        addToast('Document deleted', 'success');
        setDocuments((prev) => prev.filter((d) => d.id !== document.id));
      } else {
        addToast(result.error, 'error');
      }
    });
  };

  const handleOpenDocument = async (document: SecretaryDocument) => {
    const popup = window.open('about:blank', '_blank');
    const result = await getSecretaryDocumentUrlAction(document.id);

    if ('data' in result) {
      if (popup) {
        popup.location.href = result.data.url;
      } else {
        window.open(result.data.url, '_blank');
      }
    } else {
      popup?.close();
      addToast(result.error, 'error');
    }
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    processing: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    pending: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    failed: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    completed: <CheckCircle className="w-3.5 h-3.5" />,
    processing: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    pending: <FileQuestion className="w-3.5 h-3.5" />,
    failed: <AlertCircle className="w-3.5 h-3.5" />,
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleDocuments = documents.filter((d) =>
    !normalizedSearch || d.file_name.toLowerCase().includes(normalizedSearch)
  );

  return (
    <div
      className="flex flex-col gap-6 flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary md:text-3xl">Documents</h1>
          <p className="mt-1 text-xs text-text-muted">Upload and manage clinic PDFs. Text is extracted automatically.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            aria-label="Search documents"
            className="h-9 pl-9 pr-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Card grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {/* Upload card */}
        <form onSubmit={handleUpload} encType="multipart/form-data" className="contents">
          <div className="flex min-h-[300px] flex-col rounded-xl border-2 border-dashed border-card-border bg-card shadow-sm overflow-hidden transition-all hover:border-primary-start/40 hover:shadow-md">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="sr-only"
              id="pdf-upload"
              disabled={isUploading || isLoading}
            />
            <label
              htmlFor="pdf-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 p-6 text-center transition-all ${
                isDragging ? 'bg-primary-start/10' : selectedFile ? 'bg-primary-start/5' : ''
              } ${isUploading || isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className={`flex size-12 items-center justify-center rounded-2xl transition-colors ${
                selectedFile || isDragging ? 'bg-primary-start text-white' : 'bg-secondary-bg text-primary-start'
              }`}>
                {selectedFile ? <FileCheck2 className="size-6" /> : <Upload className="size-6" />}
              </div>
              {selectedFile ? (
                <div className="min-w-0 w-full">
                  <p className="truncate text-sm font-bold text-text-primary">{selectedFile.name}</p>
                  <p className="mt-0.5 text-[11px] text-text-muted">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-text-primary">Upload a PDF</p>
                  <p className="mt-0.5 text-xs text-text-muted">Drop here or click to browse</p>
                  <p className="mt-1 text-[10px] text-text-muted/70">PDF only · Max 10 MB</p>
                </div>
              )}
            </label>
            <div className="border-t border-card-border bg-secondary-bg/40 px-4 py-3 flex items-center justify-between gap-2">
              {selectedFile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-medium transition-colors"
                  >
                    Remove
                  </button>
                  <Button type="submit" size="sm" disabled={isUploading} className="h-7 text-xs">
                    {isUploading ? <><Loader2 className="mr-1.5 size-3.5 animate-spin" /> Uploading…</> : <><Upload className="mr-1.5 size-3.5" /> Upload</>}
                  </Button>
                </>
              ) : (
                <p className="text-[10px] text-text-muted w-full text-center">PDF · text extracted automatically</p>
              )}
            </div>
          </div>
        </form>

        {/* Loading skeletons */}
        {isLoading && documents.length === 0 &&
          [1, 2, 3].map((i) => (
            <div key={i} className="min-h-[300px] animate-pulse rounded-xl bg-secondary-bg" />
          ))
        }

        {/* Document cards */}
        {visibleDocuments.map((document) => (
          <article
            key={document.id}
            className="group flex min-h-[300px] flex-col justify-between rounded-xl border border-card-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-start/30 hover:shadow-md"
          >
            {/* Top: icon + file info */}
            <div>
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-card-border bg-red-500/10 text-red-500">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-primary" title={document.file_name}>
                    {document.file_name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">{formatDate(document.created_at)}</p>
                </div>
              </div>

              {/* Extraction info */}
              <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-text-secondary italic">
                {document.extracted_text
                  ? `"${document.extracted_text.slice(0, 220)}${document.extracted_text.length > 220 ? '…' : ''}"`
                  : document.error_message
                  ? document.error_message
                  : 'No text was extracted from this PDF.'}
              </p>
            </div>

            {/* Footer: status + size + actions */}
            <div className="mt-4 border-t border-card-border/60 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusColors[document.upload_status] ?? statusColors.pending}`}>
                    {statusIcons[document.upload_status] ?? statusIcons.pending}
                    {document.upload_status.charAt(0).toUpperCase() + document.upload_status.slice(1)}
                  </span>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-text-muted">
                    {document.extracted_text
                      ? <><CheckCircle className="size-3 text-emerald-500" />{document.extracted_text.length.toLocaleString()} chars · {formatFileSize(document.file_size)}</>
                      : <>{formatFileSize(document.file_size)}</>
                    }
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDocument(document)} aria-label={`Open ${document.file_name}`} className="h-8 gap-1 px-2 text-xs text-text-muted hover:text-sky-500">
                    <ExternalLink className="size-3.5" /> Open PDF
                  </Button>
                  <Button variant="ghost" size="sm" disabled={false} onClick={() => handleDelete(document)} aria-label={`Delete ${document.file_name}`} className="h-8 w-8 p-0 text-text-muted hover:text-rose-500">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state when search has no results */}
      {!isLoading && documents.length > 0 && visibleDocuments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-secondary-bg text-text-muted/50">
            <FileText className="size-7" />
          </div>
          <p className="mt-4 text-sm font-bold text-text-secondary">No matching documents</p>
          <p className="mt-1 text-xs text-text-muted">Try a different search term.</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="mt-4">Clear search</Button>
        </div>
      )}


    </div>
  );
}
