import { GetInvoicesDto } from "../../dtos/invoicing/get-invoices.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceQueriesRepository } from "../../repositories/invoicing/invoice.queries";

export const getInvoicesUseCase = (
  getInvoices: (params: GetInvoicesDto) => Promise<InvoiceResponseDto[]>
) => {
  return async (params: GetInvoicesDto): Promise<InvoiceResponseDto[]> => {
    return await getInvoices(params);
  };
};

/** @deprecated Use getInvoicesUseCase directly instead */
export class GetInvoicesUseCase {
  constructor(private readonly invoiceQueries: InvoiceQueriesRepository) {}

  async execute(params: GetInvoicesDto): Promise<InvoiceResponseDto[]> {
    return getInvoicesUseCase((p) => this.invoiceQueries.getInvoices(p))(params);
  }
}
