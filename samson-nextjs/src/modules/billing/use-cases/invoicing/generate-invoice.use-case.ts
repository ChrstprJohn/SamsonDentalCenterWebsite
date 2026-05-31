import { GenerateInvoiceDto } from "../../dtos/invoicing/generate-invoice.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";

export const generateInvoiceUseCase = (
  generateInvoice: (data: GenerateInvoiceDto) => Promise<InvoiceResponseDto>
) => {
  return async (data: GenerateInvoiceDto): Promise<InvoiceResponseDto> => {
    return await generateInvoice(data);
  };
};

/** @deprecated Use generateInvoiceUseCase directly instead */
export class GenerateInvoiceUseCase {
  constructor(private readonly invoiceCommands: InvoiceCommandsRepository) {}

  async execute(data: GenerateInvoiceDto): Promise<InvoiceResponseDto> {
    return generateInvoiceUseCase((d) => this.invoiceCommands.generateInvoice(d))(data);
  }
}
