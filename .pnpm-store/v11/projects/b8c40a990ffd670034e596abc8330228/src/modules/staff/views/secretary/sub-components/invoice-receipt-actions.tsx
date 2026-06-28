'use client';

import { Button } from '@/components/ui/button';

export function InvoiceReceiptActions() {
  return (
    <div className="flex gap-2 border-t border-card-border/80 pt-4 mt-2">
      <Button className="flex-1 text-xs" variant="secondary" onClick={() => alert('Opening Print dialog...')}>
        Print Receipt
      </Button>
      <Button className="flex-1 text-xs" variant="secondary" onClick={() => alert('PDF generation initiated...')}>
        Download PDF
      </Button>
    </div>
  );
}
