import { Customer, Invoice, ConsignmentNote } from "@/generated/prisma";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

type InvoiceSummaryProps = {
  invoice: Invoice & {
    customer: Customer | null;
    consignmentNote?: ConsignmentNote | null;
  };
};

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const cgstRate = Number(invoice.cgstRate);
  const sgstRate = Number(invoice.sgstRate);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invoice Details
          </h3>
          <Link
            href={`/invoices/${invoice.id}/print`}
            className="text-sm font-medium text-blue-600"
          >
            Print Invoice
          </Link>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Invoice No.</dt>
            <dd className="font-medium text-slate-900">
              {invoice.invoiceNumber}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Date</dt>
            <dd className="font-medium text-slate-900">
              {formatDate(invoice.date)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="font-medium text-slate-900">
              {invoice.invoiceType.replace("GTA_", "GTA ").replace("_", " ")}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Place of Supply</dt>
            <dd className="font-medium text-slate-900">
              {invoice.placeOfSupply}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Linked LR</dt>
            <dd className="font-medium text-slate-900">
              {invoice.consignmentNote
                ? invoice.consignmentNote.lrNumber
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card space-y-3 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Customer
        </h3>
        <p className="text-sm text-slate-900">
          <span className="font-semibold">
            {invoice.customer?.name ?? "Customer"}
          </span>
          <br />
          GST Payable By: {invoice.gstPayableBy.replace("_", " ")}
        </p>
      </div>

      <div className="card space-y-3 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Amounts
        </h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Basic</dt>
            <dd className="font-medium text-slate-900">
              {formatCurrency(Number(invoice.basicAmount))}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Total</dt>
            <dd className="font-semibold text-slate-900">
              {formatCurrency(Number(invoice.totalAmount))}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">CGST ({cgstRate}%)</dt>
            <dd className="font-medium text-slate-900">
              {formatCurrency(Number(invoice.cgstAmount))}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">SGST ({sgstRate}%)</dt>
            <dd className="font-medium text-slate-900">
              {formatCurrency(Number(invoice.sgstAmount))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card space-y-3 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Notes
        </h3>
        <p className="text-sm text-slate-700">
          {invoice.notes ??
            (invoice.invoiceType === "GTA_RCM"
              ? "GST payable by recipient under RCM."
              : "Auto-calculated GST as per selected FCM option.")}
        </p>
      </div>
    </div>
  );
}

