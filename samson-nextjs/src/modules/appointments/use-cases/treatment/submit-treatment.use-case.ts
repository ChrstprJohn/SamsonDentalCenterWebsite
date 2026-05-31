import { SupabaseClient } from '@supabase/supabase-js';
import { SubmitTreatmentDto } from '../../dtos/treatment/submit-treatment.dto';
import { TreatmentCommands } from '../../repositories/treatment/treatment.commands';
import { InvoiceCommandsRepository } from '@/modules/billing/repositories/invoicing/invoice.commands';
import { DomainError } from '@/shared/errors';

export const submitTreatmentUseCase = (deps: {
  supabase: SupabaseClient;
  submitTreatment: (appointmentId: string, clinicalNotes?: string | null) => Promise<boolean>;
  generateInvoice: (data: { appointmentId: string; amount: number; status: 'DRAFT' }) => Promise<any>;
}) => {
  return async (data: SubmitTreatmentDto): Promise<boolean> => {
    const { appointmentId, actualServices, clinicalNotes } = data;
    const actualServiceIds = actualServices.map((s) => s.serviceId);

    // 1. Fetch details of the selected services to calculate invoice amount and construct summary
    const { data: services, error: servicesError } = await deps.supabase
      .from('services')
      .select('id, name, price')
      .in('id', actualServiceIds);

    if (servicesError || !services || services.length === 0) {
      throw new DomainError(
        `Failed to fetch service details: ${servicesError?.message || 'Services not found'}`,
        'DATABASE_ERROR'
      );
    }

    // Map service ID to details
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // Construct procedures summary with comments
    const proceduresSummary = actualServices
      .map((item) => {
        const svc = serviceMap.get(item.serviceId);
        if (!svc) return '';
        const commentStr = item.comment ? ` (${item.comment})` : '';
        return `- ${svc.name}${commentStr}`;
      })
      .filter(Boolean)
      .join('\n');

    // Combine global notes with service performed summaries
    const finalNotesParts = [];
    if (clinicalNotes) {
      finalNotesParts.push(`Global Notes: ${clinicalNotes}`);
    }
    if (proceduresSummary) {
      finalNotesParts.push(`Procedures Performed:\n${proceduresSummary}`);
    }
    const finalNotes = finalNotesParts.join('\n\n');

    // Sum up service prices
    const totalAmount = services.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : Number(service.price) || 0;
      return sum + price;
    }, 0);

    // 2. Submit the treatment (updates appointment status to TREATMENT_RENDERED with notes)
    await deps.submitTreatment(appointmentId, finalNotes);

    // 3. Generate the Draft Invoice using the billing repository
    await deps.generateInvoice({
      appointmentId: appointmentId,
      amount: totalAmount,
      status: 'DRAFT',
    });

    return true;
  };
};

/** @deprecated Use submitTreatmentUseCase directly instead */
export class SubmitTreatmentUseCase {
  constructor(
    private readonly treatmentCommands: TreatmentCommands,
    private readonly invoiceCommands: InvoiceCommandsRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(data: SubmitTreatmentDto): Promise<boolean> {
    return submitTreatmentUseCase({
      supabase: this.supabase,
      submitTreatment: (aid, notes) => this.treatmentCommands.submitTreatment(aid, notes),
      generateInvoice: (inv) => this.invoiceCommands.generateInvoice(inv),
    })(data);
  }
}
