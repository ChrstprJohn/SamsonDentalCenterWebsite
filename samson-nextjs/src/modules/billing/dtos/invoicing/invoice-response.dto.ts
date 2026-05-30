import { z } from "zod";

export const invoiceStatusEnum = z.enum(["DRAFT", "FINALIZED", "PAID", "VOID"]);

export const InvoiceResponseSchema = z.object({
  id: z.string().uuid(),
  appointment_id: z.string().uuid(),
  amount: z.number().nonnegative(),
  status: invoiceStatusEnum,
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;
export type InvoiceResponseDto = z.infer<typeof InvoiceResponseSchema>;

type MaybeRecord = Record<string, unknown>;

const numberValue = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
};

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");
const nullableStringValue = (value: unknown) => (typeof value === "string" ? value : null);

export const mapInvoiceRecord = (record: MaybeRecord): InvoiceResponseDto => ({
  id: stringValue(record.id),
  appointment_id: stringValue(record.appointment_id),
  amount: numberValue(record.amount),
  status: (record.status ?? "DRAFT") as InvoiceStatus,
  created_at: nullableStringValue(record.created_at),
  updated_at: nullableStringValue(record.updated_at),
});

export const mapInvoiceRecords = (records: MaybeRecord[]) =>
  records.map((record) => mapInvoiceRecord(record));
