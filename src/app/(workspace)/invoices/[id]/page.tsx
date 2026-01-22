import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getInvoiceById } from "@/lib/invoices";
import { InvoiceSummary } from "@/components/invoices/invoice-summary";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return { title: "Invoice Not Found" };
  }
  return { title: `${invoice.invoiceNumber} | Invoice` };
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          GTA Invoice
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          {invoice.invoiceNumber}
        </h2>
        <p className="text-sm text-slate-500">
          {invoice.customer?.name ?? "Customer"}
        </p>
      </div>

      <InvoiceSummary invoice={invoice} />
    </div>
  );
}










