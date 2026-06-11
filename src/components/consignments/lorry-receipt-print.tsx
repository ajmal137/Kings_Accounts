import { ConsignmentNote, Customer, Vehicle } from "@/generated/prisma";
import { getCompanyProfile, toLogoSrc } from "@/lib/company";
import { formatCurrency, formatDate } from "@/lib/format";
import { PrintButton } from "@/components/common/print-button";

type LorryReceiptPrintProps = {
  consignment: ConsignmentNote & { customer: Customer; vehicle: Vehicle };
};

export async function LorryReceiptPrint({
  consignment,
}: LorryReceiptPrintProps) {
  const company = await getCompanyProfile();
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
          Lorry Receipt / Consignment Note
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1 border border-slate-200 p-3">
          <p>
            <span className="font-semibold">LR No:</span>{" "}
            {consignment.lrNumber}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {formatDate(consignment.date)}
          </p>
          <p>
            <span className="font-semibold">Vehicle No:</span>{" "}
            {consignment.vehicle.vehicleNumber}
          </p>
          <p>
            <span className="font-semibold">Driver / Owner:</span>{" "}
            {consignment.vehicle.ownerName}
          </p>
        </div>
        <div className="space-y-1 border border-slate-200 p-3">
          <p>
            <span className="font-semibold">From:</span>{" "}
            {consignment.fromLocation}
          </p>
          <p>
            <span className="font-semibold">To:</span>{" "}
            {consignment.toLocation}
          </p>
          <p>
            <span className="font-semibold">Risk:</span>{" "}
            {consignment.ownerRiskOrCarrierRisk.replace("_", " ")}
          </p>
          <p>
            <span className="font-semibold">Payment:</span>{" "}
            {consignment.paymentType.replace("_", " ")}
          </p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1 border border-slate-200 p-3">
          <h3 className="font-semibold uppercase tracking-wide text-slate-600">
            Consignor
          </h3>
          <p>{consignment.consignorName}</p>
          <p>{consignment.consignorAddress}</p>
          <p>GSTIN: {consignment.consignorGstin ?? "N/A"}</p>
        </div>
        <div className="space-y-1 border border-slate-200 p-3">
          <h3 className="font-semibold uppercase tracking-wide text-slate-600">
            Consignee
          </h3>
          <p>{consignment.consigneeName}</p>
          <p>{consignment.consigneeAddress}</p>
          <p>GSTIN: {consignment.consigneeGstin ?? "N/A"}</p>
        </div>
      </section>

      <section className="mt-6 border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Goods Description</th>
              <th className="px-3 py-2">Packages</th>
              <th className="px-3 py-2">Weight</th>
              <th className="px-3 py-2 text-right">Freight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-3">{consignment.goodsDescription}</td>
              <td className="px-3 py-3">{consignment.numPackages}</td>
              <td className="px-3 py-3">{Number(consignment.weight)} MT</td>
              <td className="px-3 py-3 text-right">
                {formatCurrency(Number(consignment.freightAmount))}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer className="mt-10 text-sm">
        <p>
          <span className="font-semibold">GST Note:</span>{" "}
          {consignment.gstMode === "RCM"
            ? (company.lrRcmDeclaration ?? "GTA Service – GST payable by recipient under RCM.")
            : (company.lrFcmDeclaration ?? "GTA Service – GST payable by supplier under FCM.")}
        </p>
        <div className="mt-6 flex justify-between">
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



