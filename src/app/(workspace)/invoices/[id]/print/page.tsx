import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/invoices";
import { InvoicePrint } from "@/components/invoices/invoice-print";

export const dynamic = "force-dynamic";

type InvoicePrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoicePrintPage({
  params,
}: InvoicePrintPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return <InvoicePrint invoice={invoice} />;
}






