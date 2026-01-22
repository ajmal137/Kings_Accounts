import { Customer } from "@/generated/prisma";
import { formatCurrency } from "@/lib/format";

type DebtorSubLedgerRow = {
  customer: Customer;
  balance: number;
};

type DebtorSubLedgerTableProps = {
  rows: DebtorSubLedgerRow[];
};

export function DebtorSubLedgerTable({ rows }: DebtorSubLedgerTableProps) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No customer-wise debtor balances yet.
      </div>
    );
  }

  const total = rows.reduce((sum, row) => sum + row.balance, 0);

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3 text-right">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.customer.id} className="text-slate-700">
              <td className="px-4 py-3">
                <p className="font-medium">{row.customer.name}</p>
                <p className="text-xs text-slate-500">{row.customer.contactPhone}</p>
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(row.balance)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-slate-50 text-sm font-semibold text-slate-900">
          <tr>
            <td className="px-4 py-3 text-right">Total</td>
            <td className="px-4 py-3 text-right">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

