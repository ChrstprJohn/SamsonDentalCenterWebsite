import { GenerateInvoiceDto } from "../../dtos/invoicing/generate-invoice.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";

export class GenerateInvoiceUseCase {
  constructor(private readonly invoiceCommands: InvoiceCommandsRepository) {}

  async execute(data: GenerateInvoiceDto): Promise<InvoiceResponseDto> {
    return await this.invoiceCommands.generateInvoice(data);
  }
}
