-- Create secretary documents table for PDF uploads with extracted text
-- Purpose: Store uploaded PDF documents and their extracted text content for secretary portal

CREATE TABLE IF NOT EXISTS public.secretary_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    extracted_text TEXT,
    upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    -- Keep the document if its uploader is removed, while allowing the
    -- foreign key to apply its ON DELETE SET NULL action.
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep this migration safe to re-run if an earlier attempt created the table
-- before failing while creating its policies or trigger.
DROP INDEX IF EXISTS public.idx_secretary_documents_clinic_config_id;
ALTER TABLE public.secretary_documents
    DROP COLUMN IF EXISTS clinic_config_id;

ALTER TABLE public.secretary_documents
    ALTER COLUMN uploaded_by DROP NOT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_secretary_documents_uploaded_by ON public.secretary_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_secretary_documents_created_at ON public.secretary_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_secretary_documents_upload_status ON public.secretary_documents(upload_status);

-- RLS Policies
ALTER TABLE public.secretary_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Secretary can view clinic documents" ON public.secretary_documents;
-- Secretaries and admins can view all documents
CREATE POLICY "Secretary can view clinic documents" ON public.secretary_documents
    FOR SELECT USING (
        public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
    );

DROP POLICY IF EXISTS "Secretary can insert clinic documents" ON public.secretary_documents;
-- Secretaries and admins can insert documents
CREATE POLICY "Secretary can insert clinic documents" ON public.secretary_documents
    FOR INSERT WITH CHECK (
        public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
        AND uploaded_by = auth.uid()
    );

DROP POLICY IF EXISTS "Secretary can update own documents" ON public.secretary_documents;
-- Secretaries and admins can update their own documents
CREATE POLICY "Secretary can update own documents" ON public.secretary_documents
    FOR UPDATE USING (
        uploaded_by = auth.uid()
        AND public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
    );

DROP POLICY IF EXISTS "Secretary can delete own documents" ON public.secretary_documents;
-- Secretaries and admins can delete their own documents
CREATE POLICY "Secretary can delete own documents" ON public.secretary_documents
    FOR DELETE USING (
        uploaded_by = auth.uid()
        AND public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
    );

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_secretary_documents_updated_at ON public.secretary_documents;
CREATE TRIGGER update_secretary_documents_updated_at
    BEFORE UPDATE ON public.secretary_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- Storage bucket for secretary documents (PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('secretary-documents', 'secretary-documents', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf'];

-- Storage policies for secretary-documents bucket
DROP POLICY IF EXISTS "Secretary can view clinic documents" ON storage.objects;
DROP POLICY IF EXISTS "Secretary can upload clinic documents" ON storage.objects;
DROP POLICY IF EXISTS "Secretary can update clinic documents" ON storage.objects;
DROP POLICY IF EXISTS "Secretary can delete clinic documents" ON storage.objects;

-- Allow secretaries and admins to view documents
CREATE POLICY "Secretary can view clinic documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'secretary-documents'
        AND public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
    );

-- Allow secretaries and admins to upload documents
CREATE POLICY "Secretary can upload clinic documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'secretary-documents'
        AND public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
    );

-- Allow secretaries and admins to update their own uploaded documents
CREATE POLICY "Secretary can update clinic documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'secretary-documents'
        AND owner_id = auth.uid()::text
        AND public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
    );

-- Allow secretaries and admins to delete their own uploaded documents
CREATE POLICY "Secretary can delete clinic documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'secretary-documents'
        AND owner_id = auth.uid()::text
        AND public.current_user_role() IN ('SECRETARY'::public.user_role, 'ADMIN'::public.user_role)
    );
