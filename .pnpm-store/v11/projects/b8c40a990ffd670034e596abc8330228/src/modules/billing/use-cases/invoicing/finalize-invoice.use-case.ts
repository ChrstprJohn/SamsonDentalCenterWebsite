import { FinalizeInvoiceDto } from '../../dtos/invoicing/finalize-invoice.dto';
import { InvoiceResponseDto } from '../../dtos/invoicing/invoice-response.dto';


export const finalizeInvoiceUseCase = (
  finalizeInvoice: (data: FinalizeInvoiceDto) => Promise<InvoiceResponseDto>
) => {
  return async (data: FinalizeInvoiceDto): Promise<InvoiceResponseDto> => {
    return await finalizeInvoice(data);
  };
};
