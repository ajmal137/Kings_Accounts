import { Metadata } from "next";
import { listLedgerEntries } from "@/lib/ledger";
import { getAllAccounts } from "@/lib/accounts";
import { getCustomers } from "@/lib/masters";
import { LedgerTable } from "@/components/accounting/ledger-table";
import { ManualJournalForm } from "@/components/accounting/manual-journal-form";
import { ReceiptEntryForm } from "@/components/accounting/receipt-entry-form";
import { PaymentEntryForm } from "@/components/accounting/payment-entry-form";
import { ContraEntryForm } from "@/components/accounting/contra-entry-form";

export const metadata: Metadata = {
  title: "Accounting | Kings Transport",
};

import { DateRangeFilter } from "@/components/accounting/date-range-filter";

export default async function AccountingPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const today = new Date().toISOString().split("T")[0];
  const fromStr = (searchParams.from as string) ?? today;
  const toStr = (searchParams.to as string) ?? today;

  const from = new Date(fromStr);
  const to = new Date(toStr);

  const [entries, accounts, customers] = await Promise.all([
    listLedgerEntries({ limit: 1000, from, to }), // Increased limit since we have filters
    getAllAccounts(),
    getCustomers(),
  ]);

  const cashBankAccounts = accounts.filter((account) =>
    ["CASH", "BANK"].includes(account.type)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Ledger & Journals
        </h2>
        <p className="text-sm text-slate-500">
          Review postings generated from invoices or add manual journals.
        </p>
      </div>
      <DateRangeFilter />
      <LedgerTable entries={entries} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ManualJournalForm accounts={accounts} customers={customers} />
        <ReceiptEntryForm
          accounts={accounts}
          cashBankAccounts={cashBankAccounts}
          customers={customers}
        />
        <PaymentEntryForm
          accounts={accounts}
          cashBankAccounts={cashBankAccounts}
          customers={customers}
        />
        <ContraEntryForm cashBankAccounts={cashBankAccounts} />
      </div>
    </div>
  );
}

