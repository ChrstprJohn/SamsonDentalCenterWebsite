import { SubmitTreatmentDto } from '../../dtos/treatment/submit-treatment.dto';


import { DomainError } from '@/shared/errors';
import { getServicesByIdsQuery } from '@/modules/services/repositories/management/service.queries';
import { SupabaseClient } from '@supabase/supabase-js';

export const submitTreatmentUseCase = (deps: {
  getServicesDetails: (serviceIds: string[]) => Promise<any[]>;
  submitTreatment: (appointmentId: string, clinicalNotes?: string | null) => Promise<boolean>;
  generateInvoice: (data: { appointmentId: string; amount: number; status: 'DRAFT' }) => Promise<any>;
}) => {
  return async (data: SubmitTreatmentDto): Promise<boolean> => {
    const { appointmentId, actualServices, clinicalNotes } = data;
    const actualServiceIds = actualServices.map((s) => s.serviceId);

    // 1. Fetch details of the selected services to calculate invoice amount and construct summary
    const services = await deps.getServicesDetails(actualServiceIds);

    if (!services || services.length === 0) {
      throw new DomainError(
        'Failed to fetch service details: Services not found',
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
