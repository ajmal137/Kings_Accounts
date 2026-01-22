import { z } from "zod";
import { GST_MODES, PAYMENT_TYPES, RISK_TYPES } from "./options";

const positiveNumber = z.number().nonnegative("Value cannot be negative");

export const consignmentSchema = z.object({
  date: z.string().min(1, "Date is required"),
  consignorName: z.string().min(2),
  consignorAddress: z.string().min(5),
  consignorGstin: z.string().optional().nullable(),
  consigneeName: z.string().min(2),
  consigneeAddress: z.string().min(5),
  consigneeGstin: z.string().optional().nullable(),
  customerId: z.string().min(1, "Select a customer"),
  vehicleId: z.string().min(1, "Select a vehicle"),
  fromLocation: z.string().min(2),
  toLocation: z.string().min(2),
  goodsDescription: z.string().min(3),
  numPackages: z.coerce.number().int().positive(),
  weight: z.coerce.number().positive(),
  freightAmount: z.coerce.number().positive(),
  paymentType: z.enum(PAYMENT_TYPES),
  gstMode: z.enum(GST_MODES),
  ownerRiskOrCarrierRisk: z.enum(RISK_TYPES),
  ewayBillNumber: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export type ConsignmentFormValues = z.infer<typeof consignmentSchema>;

export const invoiceSchema = z.object({
  date: z.string().min(1),
  customerId: z.string().min(1),
  consignmentNoteId: z.string().optional().nullable(),
  invoiceType: z.enum(["GTA_RCM", "GTA_FCM_5", "GTA_FCM_18"]),
  description: z.string().min(3),
  placeOfSupply: z.string().min(2),
  basicAmount: z.coerce.number().positive(),
  cgstRate: positiveNumber.max(18),
  sgstRate: positiveNumber.max(18),
  notes: z.string().optional().nullable(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const ledgerEntrySchema = z.object({
  date: z.string().min(1),
  description: z.string().min(3),
  debitAccountId: z.string().min(1),
  creditAccountId: z.string().min(1),
  amount: z.coerce.number().positive(),
  customerId: z
    .string()
    .min(1)
    .optional()
    .transform((value) => value || undefined),
});

export type LedgerEntryFormValues = z.infer<typeof ledgerEntrySchema>;



