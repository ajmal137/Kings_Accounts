import { Account } from "@/generated/prisma";
import { formatCurrency } from "@/lib/format";

type TrialBalanceRow = {
  account: Account;
  debitTotal: number;
  creditTotal: number;
};

type TrialBalanceTableProps = {
  rows: TrialBalanceRow[];
};

export function TrialBalanceTable({ rows }: TrialBalanceTableProps) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.debit += row.debitTotal;
      acc.credit += row.creditTotal;
      return acc;
    },
    { debit: 0, credit: 0 }
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Account</th>
            <th className="px-4 py-3 text-right">Debit</th>
            <th className="px-4 py-3 text-right">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.account.id} className="text-slate-700">
              <td className="px-4 py-3">
                <p className="font-medium">{row.account.name}</p>
                <p className="text-xs text-slate-500">{row.account.type}</p>
              </td>
              <td className="px-4 py-3 text-right">
                {row.debitTotal ? formatCurrency(row.debitTotal) : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {row.creditTotal ? formatCurrency(row.creditTotal) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-slate-50 text-sm font-semibold text-slate-900">
          <tr>
            <td className="px-4 py-3 text-right">Total</td>
            <td className="px-4 py-3 text-right">
              {formatCurrency(totals.debit)}
            </td>
            <td className="px-4 py-3 text-right">
              {formatCurrency(totals.credit)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}










