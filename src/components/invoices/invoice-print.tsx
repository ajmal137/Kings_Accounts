import { Customer, Invoice, ConsignmentNote } from "@/generated/prisma";
import { getCompanyProfile, toLogoSrc } from "@/lib/company";
import { formatCurrency, formatDate } from "@/lib/format";
import { PrintButton } from "@/components/common/print-button";

type InvoicePrintProps = {
  invoice: Invoice & {
    customer: Customer | null;
    consignmentNote?: ConsignmentNote | null;
  };
};

export async function InvoicePrint({ invoice }: InvoicePrintProps) {
  const company = await getCompanyProfile();
  const cgstRate = Number(invoice.cgstRate);
  const sgstRate = Number(invoice.sgstRate);
  const logoSrc = "logoData" in company ? toLogoSrc(company.logoData) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white px-10 py-8 text-slate-900 print:px-0 print-page">
      {logoSrc && (
        <div
          className="print-watermark"
          style={{ backgroundImage: `url(${logoSrc})` }}
        />
      )}
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <header className="text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          {company.firmName}
        </h1>
        <p className="text-sm">
          {company.address ?? "Set address in Settings"} · GSTIN:{" "}
          {company.gstin ?? "—"} · Phone: {company.phone ?? "—"}
        </p>
        <p className="mt-2 text-lg font-semibold uppercase">
          Tax Invoice – {invoice.invoiceType.replace("GTA_", "GTA ")}
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1 border border-slate-200 p-3">
          <p>
            <span className="font-semibold">Invoice No:</span>{" "}
            {invoice.invoiceNumber}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {formatDate(invoice.date)}
          </p>
          <p>
            <span className="font-semibold">Place of Supply:</span>{" "}
            {invoice.placeOfSupply}
          </p>
          <p>
            <span className="font-semibold">Linked LR:</span>{" "}
            {invoice.consignmentNote?.lrNumber ?? "—"}
          </p>
        </div>
        <div className="space-y-1 border border-slate-200 p-3">
          <p>
            <span className="font-semibold">Billed To:</span>{" "}
            {invoice.customer?.name ?? "Customer"}
          </p>
          <p>GST Payable By: {invoice.gstPayableBy.replace("_", " ")}</p>
        </div>
      </section>

      <section className="mt-6 border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-3">{invoice.description}</td>
              <td className="px-3 py-3 text-right">
                {formatCurrency(Number(invoice.basicAmount))}
              </td>
            </tr>
            {cgstRate > 0 && (
              <tr>
                <td className="px-3 py-3">
                  CGST @ {cgstRate}%
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(Number(invoice.cgstAmount))}
                </td>
              </tr>
            )}
            {sgstRate > 0 && (
              <tr>
                <td className="px-3 py-3">
                  SGST @ {sgstRate}%
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(Number(invoice.sgstAmount))}
                </td>
              </tr>
            )}
            <tr className="font-semibold">
              <td className="px-3 py-3">Total</td>
              <td className="px-3 py-3 text-right">
                {formatCurrency(Number(invoice.totalAmount))}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-6 text-sm">
        {invoice.invoiceType === "GTA_RCM" ? (
          <p>
            GST payable by recipient under reverse charge mechanism as per GTA
            notification.
          </p>
        ) : invoice.invoiceType === "GTA_FCM_5" ? (
          <p>No ITC available to supplier under 5% FCM option.</p>
        ) : (
          <p>Input tax credit available subject to GST rules.</p>
        )}
        <p className="mt-2">{invoice.notes ?? ""}</p>
      </section>

      <footer className="mt-10 text-sm">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">For {company.firmName}</p>
            <p className="mt-8">Authorised Signatory</p>
          </div>
          <div>
            <p className="font-semibold">Receiver&apos;s Signature</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

