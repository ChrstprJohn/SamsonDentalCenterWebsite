import { FinalizeInvoiceDto } from "../../dtos/invoicing/finalize-invoice.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";

export const finalizeInvoiceUseCase = (
  finalizeInvoice: (data: FinalizeInvoiceDto) => Promise<InvoiceResponseDto>
) => {
  return async (data: FinalizeInvoiceDto): Promise<InvoiceResponseDto> => {
    return await finalizeInvoice(data);
  };
};

/** @deprecated Use finalizeInvoiceUseCase directly instead */
export class FinalizeInvoiceUseCase {
  constructor(private readonly repository: InvoiceCommandsRepository) {}

  async execute(data: FinalizeInvoiceDto): Promise<InvoiceResponseDto> {
    return finalizeInvoiceUseCase((d) => this.repository.finalizeInvoice(d))(data);
  }
}
