import { GenerateInvoiceDto } from '../../dtos/invoicing/generate-invoice.dto';
import { InvoiceResponseDto } from '../../dtos/invoicing/invoice-response.dto';


export const generateInvoiceUseCase = (
  generateInvoice: (data: GenerateInvoiceDto) => Promise<InvoiceResponseDto>
) => {
  return async (data: GenerateInvoiceDto): Promise<InvoiceResponseDto> => {
    return await generateInvoice(data);
  };
};
