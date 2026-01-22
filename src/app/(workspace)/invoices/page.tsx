import { Metadata } from "next";
import Link from "next/link";
import { listInvoices } from "@/lib/invoices";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { INVOICE_TYPES } from "@/lib/options";

export const metadata: Metadata = {
  title: "Invoices | Kings Transport",
};

type InvoicesPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  const params = await searchParams;
  const invoices = await listInvoices({
    type: params.type,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            GTA Invoices
          </h2>
          <p className="text-sm text-slate-500">
            Track RCM and FCM invoices with automatic ledger postings.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create Invoice
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
        <label className="text-sm font-medium text-slate-600">
          Filter by type
        </label>
        <select
          name="type"
          defaultValue={params.type ?? ""}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          {INVOICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace("GTA_", "GTA ").replace("_", " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Apply
        </button>
      </form>

      <InvoiceTable invoices={invoices} />
    </div>
  );
}

