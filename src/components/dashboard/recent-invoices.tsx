import { Customer, Invoice } from "@/generated/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

type RecentInvoicesProps = {
  invoices: Array<Invoice & { customer: Customer | null }>;
};

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No invoices created yet. Raise your first GTA invoice to see it here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Invoice No.</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="text-slate-700">
              <td className="px-4 py-3 font-medium">
                {invoice.invoiceNumber}
              </td>
              <td className="px-4 py-3">{formatDate(invoice.date)}</td>
              <td className="px-4 py-3">
                {invoice.customer?.name ?? "Customer"}
              </td>
              <td className="px-4 py-3">
                {invoice.invoiceType.replace("GTA_", "").replace("_", " ")}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(Number(invoice.totalAmount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}










