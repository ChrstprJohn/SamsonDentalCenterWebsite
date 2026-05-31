import { UpdateInvoiceDto } from "../../dtos/invoicing/update-invoice.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";

export const updateInvoiceUseCase = (
  updateInvoice: (data: UpdateInvoiceDto) => Promise<InvoiceResponseDto>
) => {
  return async (data: UpdateInvoiceDto): Promise<InvoiceResponseDto> => {
    return await updateInvoice(data);
  };
};

/** @deprecated Use updateInvoiceUseCase directly instead */
export class UpdateInvoiceUseCase {
  constructor(private readonly invoiceCommands: InvoiceCommandsRepository) {}

  async execute(data: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    return updateInvoiceUseCase((d) => this.invoiceCommands.updateInvoice(d))(data);
  }
}
