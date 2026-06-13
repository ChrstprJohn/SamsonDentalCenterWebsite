import { GetInvoicesDto } from '../../dtos/invoicing/get-invoices.dto';
import { InvoiceResponseDto } from '../../dtos/invoicing/invoice-response.dto';


export const getInvoicesUseCase = (
  getInvoices: (params: GetInvoicesDto) => Promise<InvoiceResponseDto[]>
) => {
  return async (params: GetInvoicesDto): Promise<InvoiceResponseDto[]> => {
    return await getInvoices(params);
  };
};
