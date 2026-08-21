"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { FileText, Upload, Trash2, Loader2, CheckCircle, AlertCircle, FileQuestion, Eye, ExternalLink, Search, X, FileCheck2, Sparkles, HardDrive, Copy, Check } from 'lucide-react';
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
  const [previewDocument, setPreviewDocument] = useState<SecretaryDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copied, setCopied] = useState(false);
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

  const handlePreview = (document: SecretaryDocument) => {
    setPreviewDocument(document);
  };

  const handleClosePreview = () => {
    setPreviewDocument(null);
    setCopied(false);
  };

  const handleCopyText = async () => {
    if (!previewDocument?.extracted_text) return;

    try {
      await navigator.clipboard.writeText(previewDocument.extracted_text);
      setCopied(true);
      addToast('Extracted text copied', 'success');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      addToast('Could not copy extracted text', 'error');
    }
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

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleDocuments = documents.filter((document) => {
    const matchesSearch = !normalizedSearchQuery || document.file_name.toLowerCase().includes(normalizedSearchQuery);
    const matchesStatus = statusFilter === 'all' || document.upload_status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const completedCount = documents.filter((document) => document.upload_status === 'completed').length;
  const failedCount = documents.filter((document) => document.upload_status === 'failed').length;
  const extractedCharacters = documents.reduce((total, document) => total + (document.extracted_text?.length || 0), 0);

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-start">
            <FileCheck2 className="size-3.5" />
            Secretary library
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">Documents</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            Keep PDFs in one place, extract their text automatically, and give the team a quick way to review the source file.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="min-w-[92px] rounded-2xl border border-card-border bg-card px-3.5 py-3 shadow-sm">
            <p className="text-xl font-extrabold leading-none text-text-primary">{documents.length}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Total files</p>
          </div>
          <div className="min-w-[92px] rounded-2xl border border-card-border bg-card px-3.5 py-3 shadow-sm">
            <p className="text-xl font-extrabold leading-none text-emerald-600">{completedCount}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Processed</p>
          </div>
          <div className="min-w-[92px] rounded-2xl border border-card-border bg-card px-3.5 py-3 shadow-sm">
            <p className="text-xl font-extrabold leading-none text-rose-500">{failedCount}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Needs review</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section className="relative overflow-hidden rounded-3xl border border-primary-start/20 bg-gradient-to-br from-primary-start/[0.08] via-card to-card p-5 shadow-lg md:p-6">
          <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-primary-start/10 blur-3xl" />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-start text-white shadow-lg shadow-primary-start/20">
                  <Upload className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-start">Add to library</p>
                  <h2 className="mt-1 text-lg font-bold text-text-primary">Upload a PDF</h2>
                  <p className="mt-1 max-w-md text-xs leading-5 text-text-muted">We’ll save the original file and extract searchable text automatically.</p>
                </div>
              </div>
              <span className="rounded-full border border-primary-start/20 bg-card/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-start">PDF only</span>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-4" encType="multipart/form-data">
              <div className="relative">
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
                  className={`flex min-h-[170px] cursor-pointer flex-col justify-center rounded-2xl border-2 border-dashed p-5 transition-all ${
                    selectedFile || isDragging
                      ? 'border-primary-start bg-primary-start/10 shadow-inner'
                      : 'border-card-border bg-card/60 hover:border-primary-start/50 hover:bg-card'
                  } ${isUploading || isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${selectedFile || isDragging ? 'bg-primary-start text-white' : 'bg-secondary-bg text-primary-start'}`}>
                      {selectedFile ? <FileCheck2 className="size-6" /> : <Upload className="size-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      {selectedFile ? (
                        <>
                          <p className="truncate text-sm font-bold text-text-primary">{selectedFile.name}</p>
                          <p className="mt-1 text-xs text-text-muted">{formatFileSize(selectedFile.size)} <span className="mx-1">•</span> Ready to upload</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-text-primary">Drop your PDF here</p>
                          <p className="mt-1 text-xs text-text-muted">or click to browse from your device</p>
                        </>
                      )}
                    </div>
                    {!selectedFile && <span className="hidden rounded-lg bg-secondary-bg px-2 py-1 text-[10px] font-bold text-text-muted sm:inline-flex">MAX 10 MB</span>}
                  </div>

                  {selectedFile ? (
                    <div className="mt-5 flex items-center justify-between border-t border-primary-start/15 pt-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600"><CheckCircle className="size-3.5" /> File validated</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelectedFile(null); }}
                        disabled={isUploading || isLoading}
                        className="h-7 px-2 text-[11px] text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="mr-1.5 size-3.5" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-card-border/70 pt-3 text-[10px] font-medium text-text-muted">
                      <span className="rounded-lg bg-secondary-bg px-2 py-1">Text extraction included</span>
                      <span className="rounded-lg bg-secondary-bg px-2 py-1">Private storage</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-[11px] text-text-muted"><Sparkles className="size-3.5 text-primary-start" /> Text extraction runs automatically after upload.</p>
                <Button type="submit" disabled={!selectedFile || isUploading || isLoading} className="w-full sm:w-auto sm:min-w-[170px]">
                  {isUploading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Processing...</> : <><Upload className="mr-2 size-4" /> Upload & extract</>}
                </Button>
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-3xl border border-card-border bg-card p-5 shadow-lg md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-secondary-bg text-primary-start"><Sparkles className="size-4" /></div>
              <div>
                <h2 className="text-sm font-bold text-text-primary">Library snapshot</h2>
                <p className="text-[10px] text-text-muted">A quick view of your document set</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" /> Live</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-card-border bg-secondary-bg/50 p-3">
              <p className="text-xl font-extrabold text-text-primary">{documents.length}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Files stored</p>
            </div>
            <div className="rounded-2xl border border-card-border bg-secondary-bg/50 p-3">
              <p className="text-xl font-extrabold text-emerald-600">{extractedCharacters.toLocaleString()}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Characters extracted</p>
            </div>
            <div className="rounded-2xl border border-card-border bg-secondary-bg/50 p-3">
              <p className="text-xl font-extrabold text-primary-start">{completedCount}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Ready to review</p>
            </div>
            <div className="rounded-2xl border border-card-border bg-secondary-bg/50 p-3">
              <p className="text-xl font-extrabold text-rose-500">{failedCount}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Needs attention</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-card-border bg-secondary-bg/40 p-3.5">
            <HardDrive className="mt-0.5 size-4 shrink-0 text-text-muted" />
            <div>
              <p className="text-xs font-bold text-text-primary">Private document storage</p>
              <p className="mt-1 text-[11px] leading-5 text-text-muted">Files are opened through secure, time-limited links.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-lg">
        <div className="border-b border-card-border p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">Your documents</h2>
                {isLoading && <Loader2 className="size-4 animate-spin text-primary-start" />}
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {visibleDocuments.length === documents.length ? `${documents.length} document${documents.length !== 1 ? 's' : ''}` : `Showing ${visibleDocuments.length} of ${documents.length}`}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-[230px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search documents..." aria-label="Search documents" className="h-10 pl-9 pr-3 text-xs" />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter documents by status" className="h-10 rounded-xl border border-card-border bg-card px-3 text-xs font-semibold text-text-secondary outline-none transition-colors focus:border-primary-start/50">
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Needs attention</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && documents.length === 0 ? (
          <div className="grid gap-3 p-4 md:p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-secondary-bg" />)}
          </div>
        ) : visibleDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-secondary-bg text-text-muted/50"><FileText className="size-7" /></div>
            <h3 className="mt-4 text-base font-bold text-text-secondary">{documents.length === 0 ? 'Your library is empty' : 'No matching documents'}</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-text-muted">{documents.length === 0 ? 'Upload a PDF above to start building your shared document library.' : 'Try a different search term or clear the status filter.'}</p>
            {documents.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-4">Clear filters</Button>}
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:p-5">
            {visibleDocuments.map((document) => (
              <article key={document.id} className="group flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-4 transition-all hover:border-primary-start/30 hover:shadow-md md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500"><FileText className="size-5" /></div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-primary" title={document.file_name}>{document.file_name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-text-muted">
                      <span>{formatFileSize(document.file_size)}</span><span className="text-card-border">•</span><span>{formatDate(document.created_at)}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
                      {document.extracted_text ? <><CheckCircle className="size-3.5 text-emerald-500" /> {document.extracted_text.length.toLocaleString()} characters extracted</> : document.error_message ? <><AlertCircle className="size-3.5 text-rose-500" /> Text extraction failed</> : <><FileQuestion className="size-3.5" /> No text extracted</>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${statusColors[document.upload_status] || statusColors.pending}`}>
                    {statusIcons[document.upload_status] || statusIcons.pending}
                    {document.upload_status.charAt(0).toUpperCase() + document.upload_status.slice(1)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handlePreview(document)} aria-label={`Preview ${document.file_name}`} className="text-text-secondary hover:text-primary-start"><Eye className="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleOpenDocument(document)} aria-label={`Open ${document.file_name}`} className="text-text-secondary hover:text-sky-500"><ExternalLink className="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(document)} aria-label={`Delete ${document.file_name}`} className="text-text-secondary hover:text-rose-500"><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {previewDocument && (
        <div role="dialog" aria-modal="true" aria-labelledby="document-preview-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) handleClosePreview(); }}>
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-card-border bg-card shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-card-border p-5 md:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500"><FileText className="size-5" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-start">Document preview</p>
                  <h3 id="document-preview-title" className="mt-1 truncate text-base font-bold text-text-primary md:text-lg">{previewDocument.file_name}</h3>
                  <p className="mt-1 text-[11px] text-text-muted">{formatFileSize(previewDocument.file_size)} <span className="mx-1">•</span> {formatDate(previewDocument.created_at)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClosePreview} aria-label="Close preview"><X className="size-5" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-7">
              {previewDocument.extracted_text ? (
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Extracted text</h4>
                      <p className="mt-1 text-[11px] text-text-muted">{previewDocument.extracted_text.length.toLocaleString()} characters available for review</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleCopyText}>{copied ? <><Check className="mr-1.5 size-3.5 text-emerald-600" /> Copied</> : <><Copy className="mr-1.5 size-3.5" /> Copy text</>}</Button>
                  </div>
                  <pre className="max-h-[55vh] overflow-x-auto whitespace-pre-wrap rounded-2xl border border-card-border bg-secondary-bg/60 p-4 text-xs leading-6 text-text-secondary md:p-5">{previewDocument.extracted_text}</pre>
                </div>
              ) : previewDocument.error_message ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-16 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500"><AlertCircle className="size-6" /></div>
                  <p className="mt-4 text-sm font-bold text-rose-600">Text extraction needs attention</p>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-text-muted">{previewDocument.error_message}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-secondary-bg/40 px-6 py-16 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-text-muted"><FileQuestion className="size-6" /></div>
                  <p className="mt-4 text-sm font-bold text-text-secondary">No text was extracted</p>
                  <p className="mt-1 text-xs text-text-muted">This may be a scanned PDF or a document without an embedded text layer.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-card-border p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${statusColors[previewDocument.upload_status] || statusColors.pending}`}>
                {statusIcons[previewDocument.upload_status] || statusIcons.pending}
                {previewDocument.upload_status.charAt(0).toUpperCase() + previewDocument.upload_status.slice(1)}
              </span>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={handleClosePreview}>Close</Button>
                <Button onClick={() => handleOpenDocument(previewDocument)}><ExternalLink className="mr-2 size-4" /> Open original PDF</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
