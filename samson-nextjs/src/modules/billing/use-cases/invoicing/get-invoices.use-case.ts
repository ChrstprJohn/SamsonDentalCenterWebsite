import { GetInvoicesDto } from "../../dtos/invoicing/get-invoices.dto";
import { InvoiceResponseDto } from "../../dtos/invoicing/invoice-response.dto";
import { InvoiceQueriesRepository } from "../../repositories/invoicing/invoice.queries";

export class GetInvoicesUseCase {
  constructor(private readonly invoiceQueries: InvoiceQueriesRepository) {}

  async execute(params: GetInvoicesDto): Promise<InvoiceResponseDto[]> {
    return await this.invoiceQueries.getInvoices(params);
  }
}
