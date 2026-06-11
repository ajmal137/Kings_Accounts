import { Metadata } from "next";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getCustomers } from "@/lib/masters";
import { prisma } from "@/lib/prisma";
import { getTaxSetting } from "@/lib/tax";
import { getCompanyProfile } from "@/lib/company";
import type { ConsignmentNote, TaxSetting } from "@/generated/prisma";

type ConsignmentForForm = Omit<ConsignmentNote, "weight" | "freightAmount"> & {
  weight: number;
  freightAmount: number;
};

type TaxSettingForForm = {
  fc5CgstRate: number;
  fc5SgstRate: number;
  fc18CgstRate: number;
  fc18SgstRate: number;
};

export const metadata: Metadata = {
  title: "Create Invoice | Kings Transport",
};

export default async function NewInvoicePage() {
  const [customers, consignments, taxSetting, company] = await Promise.all([
    getCustomers(),
    prisma.consignmentNote.findMany({
      orderBy: { date: "desc" },
      take: 50,
    }),
    getTaxSetting(),
    getCompanyProfile(),
  ]);

  const safeConsignments: ConsignmentForForm[] = consignments.map((c) => ({
    ...c,
    weight: Number(c.weight),
    freightAmount: Number(c.freightAmount),
  }));

  const safeTaxSetting: TaxSettingForForm = {
    fc5CgstRate: Number(taxSetting.fc5CgstRate),
    fc5SgstRate: Number(taxSetting.fc5SgstRate),
    fc18CgstRate: Number(taxSetting.fc18CgstRate),
    fc18SgstRate: Number(taxSetting.fc18SgstRate),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Create GTA Invoice
        </h2>
        <p className="text-sm text-slate-500">
          Choose invoice mode (RCM or FCM) and we&apos;ll auto-calc GST and
          ledger entries.
        </p>
      </div>
      <InvoiceForm
        customers={customers}
        consignments={safeConsignments}
        taxSetting={safeTaxSetting}
        invoicePrefix={company.invoicePrefix}
      />
    </div>
  );
}



