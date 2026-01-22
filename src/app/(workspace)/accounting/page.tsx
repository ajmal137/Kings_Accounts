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

export default async function AccountingPage() {
  const [entries, accounts, customers] = await Promise.all([
    listLedgerEntries({ limit: 30 }),
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

