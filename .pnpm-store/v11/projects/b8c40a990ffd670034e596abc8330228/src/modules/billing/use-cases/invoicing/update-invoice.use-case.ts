import { UpdateInvoiceDto } from '../../dtos/invoicing/update-invoice.dto';
import { InvoiceResponseDto } from '../../dtos/invoicing/invoice-response.dto';


export const updateInvoiceUseCase = (
  updateInvoice: (data: UpdateInvoiceDto) => Promise<InvoiceResponseDto>
) => {
  return async (data: UpdateInvoiceDto): Promise<InvoiceResponseDto> => {
    return await updateInvoice(data);
  };
};
