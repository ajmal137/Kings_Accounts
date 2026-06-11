import { Customer, Invoice, ConsignmentNote } from "@/generated/prisma";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { DeleteInvoiceButton } from "./delete-invoice-button";
import { EditInvoiceButton } from "./edit-invoice-button";


type InvoiceTableProps = {
  invoices: Array<
    Invoice & {
      customer: Customer | null;
      consignmentNote?: ConsignmentNote | null;
    }
  >;
};

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (!invoices.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No invoices found. Create a GTA invoice to see it listed here.
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
            <th className="px-4 py-3">Linked LR</th>
            <th className="px-4 py-3 text-right">Total Amount</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="text-slate-700">
              <td className="px-4 py-3 font-medium">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{formatDate(invoice.date)}</td>
              <td className="px-4 py-3">{invoice.customer?.name ?? "—"}</td>
              <td className="px-4 py-3">
                {invoice.invoiceType.replace("GTA_", "GTA ").replace("_", " ")}
              </td>
              <td className="px-4 py-3">
                {invoice.consignmentNoteId
                  ? invoice.consignmentNote?.lrNumber ?? "Linked"
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(Number(invoice.totalAmount))}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2 items-start">
                  <EditInvoiceButton invoiceId={invoice.id} />
                  <DeleteInvoiceButton invoiceId={invoice.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

