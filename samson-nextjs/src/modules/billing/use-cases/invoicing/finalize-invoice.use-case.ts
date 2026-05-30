import { FinalizeInvoiceDto } from "../../dtos/invoicing/finalize-invoice.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";

export class FinalizeInvoiceUseCase {
  constructor(private readonly repository: InvoiceCommandsRepository) {}

  async execute(data: FinalizeInvoiceDto): Promise<InvoiceResponseDto> {
    return await this.repository.finalizeInvoice(data);
  }
}
