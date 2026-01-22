export const PAYMENT_TYPES = ["PAID", "TO_PAY", "TBB"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const GST_MODES = ["RCM", "FCM_5", "FCM_18"] as const;
export type GstMode = (typeof GST_MODES)[number];

export const RISK_TYPES = ["OWNER_RISK", "CARRIER_RISK"] as const;
export type RiskType = (typeof RISK_TYPES)[number];

export const INVOICE_TYPES = [
  "GTA_RCM",
  "GTA_FCM_5",
  "GTA_FCM_18",
] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];

export const GST_PAYABLE_BY = ["RECIPIENT_RCM", "SUPPLIER_FCM"] as const;
export type GstPayableBy = (typeof GST_PAYABLE_BY)[number];

export const ACCOUNT_TYPES = [
  "ASSET",
  "LIABILITY",
  "INCOME",
  "EXPENSE",
  "BANK",
  "CASH",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];










