'use client';

import { Button } from '@/components/ui/button';

interface InvoiceReceiptActionsProps {
  onPrint?: () => void;
}

export function InvoiceReceiptActions({ onPrint }: InvoiceReceiptActionsProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex gap-2 border-t border-card-border/80 pt-4 mt-2 print:hidden">
      <Button className="flex-1 text-xs" variant="secondary" onClick={handlePrint}>
        Print Receipt
      </Button>
      <Button className="flex-1 text-xs" variant="secondary" onClick={handlePrint}>
        Download PDF
      </Button>
    </div>
  );
}
