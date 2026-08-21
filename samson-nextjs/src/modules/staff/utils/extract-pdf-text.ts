import { getPath } from 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';

// Next.js otherwise bundles pdf.js's worker into .next and leaves the parser
// pointing at a worker file that does not exist at runtime.
PDFParse.setWorker(getPath());

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text || '';
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract text from PDF: ${message}`);
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromPDFFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return extractTextFromPDF(buffer);
}
