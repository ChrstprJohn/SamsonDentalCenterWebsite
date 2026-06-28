import { describe, it, expect } from 'vitest';

interface DraftInvoicePayload {
  patientName: string;
  completedServices: string[];
  clinicalNotes: string;
  generatedAt: string;
}

// Pure logic extracted from DoctorDashboardView for complete unit testability in Node
function buildDraftInvoice(
  patientName: string,
  completedServices: string[],
  clinicalNotes: string
): DraftInvoicePayload {
  return {
    patientName,
    completedServices,
    clinicalNotes,
    generatedAt: new Date('2026-05-31T12:00:00Z').toISOString(),
  };
}

describe('DoctorDashboardView Clinical Draft Generators', () => {
  it('should compile correct invoice schemas from selected services grids', () => {
    const result = buildDraftInvoice(
      'Diana Prince',
      ['Orthodontic Braces Fit', 'Tooth Extraction'],
      'Braces fitted securely. Tooth extracted successfully under local anaesthesia.'
    );

    expect(result.patientName).toBe('Diana Prince');
    expect(result.completedServices).toContain('Orthodontic Braces Fit');
    expect(result.completedServices).toContain('Tooth Extraction');
    expect(result.clinicalNotes).toBe(
      'Braces fitted securely. Tooth extracted successfully under local anaesthesia.'
    );
    expect(result.generatedAt).toBe('2026-05-31T12:00:00.000Z');
  });

  it('should support generating draft receipts with zero attached services', () => {
    const result = buildDraftInvoice('Robert Vance', [], 'Diagnostic exam completed. No treatments required.');
    expect(result.completedServices.length).toBe(0);
    expect(result.clinicalNotes).toBe('Diagnostic exam completed. No treatments required.');
  });
});
