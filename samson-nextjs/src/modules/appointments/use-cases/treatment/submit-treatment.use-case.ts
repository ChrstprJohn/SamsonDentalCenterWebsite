import { SupabaseClient } from '@supabase/supabase-js';
import { SubmitTreatmentDto } from '../../dtos/treatment/submit-treatment.dto';
import { TreatmentCommands } from '../../repositories/treatment/treatment.commands';
import { InvoiceCommandsRepository } from '@/modules/billing/repositories/invoicing/invoice.commands';
import { DomainError } from '@/shared/errors';

export class SubmitTreatmentUseCase {
  constructor(
    private readonly treatmentCommands: TreatmentCommands,
    private readonly invoiceCommands: InvoiceCommandsRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(data: SubmitTreatmentDto): Promise<boolean> {
    const { appointmentId, actualServiceIds, clinicalNotes } = data;

    // 1. Fetch prices of the selected services to calculate invoice amount
    const { data: services, error: servicesError } = await this.supabase
      .from('services')
      .select('id, price')
      .in('id', actualServiceIds);

    if (servicesError || !services || services.length === 0) {
      throw new DomainError(
        `Failed to fetch service prices: ${servicesError?.message || 'Services not found'}`,
        'DATABASE_ERROR'
      );
    }

    // Sum up service prices (fall back to 0 if price is null/undefined)
    const totalAmount = services.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : Number(service.price) || 0;
      return sum + price;
    }, 0);

    // 2. Submit the treatment (updates appointment status to TREATMENT_RENDERED)
    await this.treatmentCommands.submitTreatment(appointmentId, clinicalNotes);

    // 3. Generate the Draft Invoice using the billing repository
    await this.invoiceCommands.generateInvoice({
      appointment_id: appointmentId,
      amount: totalAmount,
      status: 'DRAFT',
    });

    return true;
  }
}
