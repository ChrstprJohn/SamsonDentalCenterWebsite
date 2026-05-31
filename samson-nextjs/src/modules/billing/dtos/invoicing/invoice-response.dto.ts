import { z } from "zod";

export const invoiceStatusEnum = z.enum(["DRAFT", "FINALIZED", "PAID", "VOID"]);
export const paymentMethodEnum = z.enum(["CASH", "CARD", "HMO"]);

export const invoiceResponseSchema = z.preprocess(
  (record: any) => {
    if (!record || typeof record !== 'object') return record;
    const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
    const numberValue = (value: unknown) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") return Number(value) || 0;
      return 0;
    };

    const nullableNumberValue = (value: unknown) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") return Number(value) || null;
      return null;
    };

    return {
      id: stringValue(record.id),
      appointmentId: stringValue(record.appointment_id ?? record.appointmentId),
      amount: numberValue(record.amount),
      status: record.status ?? "DRAFT",
      paymentMethod: record.payment_method ?? record.paymentMethod ?? null,
      discountApplied: nullableNumberValue(record.discount_applied ?? record.discountApplied),
      createdAt: typeof record.created_at === 'string' ? record.created_at : record.createdAt,
      updatedAt: typeof record.updated_at === 'string' ? record.updated_at : record.updatedAt,
    };
  },
  z.object({
    id: z.string().uuid(),
    appointmentId: z.string().uuid(),
    amount: z.number().nonnegative(),
    status: invoiceStatusEnum,
    paymentMethod: paymentMethodEnum.nullable().optional(),
    discountApplied: z.number().nonnegative().nullable().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
);

export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;
export type InvoiceResponseDto = z.infer<typeof invoiceResponseSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapInvoiceRecord = (record: MaybeRecord): InvoiceResponseDto => {
  return invoiceResponseSchema.parse(record);
};

export const mapInvoiceRecords = (records: MaybeRecord[]): InvoiceResponseDto[] =>
  records.map((record) => mapInvoiceRecord(record));
