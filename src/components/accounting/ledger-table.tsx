import {
  LedgerEntry,
  Account,
  Invoice,
  ConsignmentNote,
  Customer,
} from "@/generated/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { DeleteEntryButton } from "./delete-entry-button";

type LedgerEntryWithRelations = LedgerEntry & {
  debitAccount: Account;
  creditAccount: Account;
  linkedInvoice: Invoice | null;
  linkedConsignment: ConsignmentNote | null;
  customer: Customer | null;
};

type LedgerTableProps = {
  entries: LedgerEntryWithRelations[];
};

export function LedgerTable({ entries }: LedgerTableProps) {
  if (!entries.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No ledger entries yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Debit</th>
            <th className="px-4 py-3">Credit</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <tr key={entry.id} className="text-slate-700">
              <td className="px-4 py-3">{formatDate(entry.date)}</td>
              <td className="px-4 py-3">
                {entry.description}
                {entry.linkedInvoice && (
                  <span className="block text-xs text-slate-500">
                    Invoice #{entry.linkedInvoice.invoiceNumber}
                  </span>
                )}
                {entry.linkedConsignment && (
                  <span className="block text-xs text-slate-500">
                    LR #{entry.linkedConsignment.lrNumber}
                  </span>
                )}
                {entry.customer && (
                  <span className="block text-xs text-slate-500">
                    Customer: {entry.customer.name}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{entry.debitAccount.name}</td>
              <td className="px-4 py-3">{entry.creditAccount.name}</td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(Number(entry.amount))}
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteEntryButton entryId={entry.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

