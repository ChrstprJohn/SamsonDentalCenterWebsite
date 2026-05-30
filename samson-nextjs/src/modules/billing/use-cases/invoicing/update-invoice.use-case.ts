import { UpdateInvoiceDto } from "../../dtos/invoicing/update-invoice.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";

export class UpdateInvoiceUseCase {
  constructor(private readonly invoiceCommands: InvoiceCommandsRepository) {}

  async execute(data: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    return await this.invoiceCommands.updateInvoice(data);
  }
}
