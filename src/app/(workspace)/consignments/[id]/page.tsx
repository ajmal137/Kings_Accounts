import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getConsignmentById } from "@/lib/consignments";
import { ConsignmentSummary } from "@/components/consignments/consignment-summary";

type ConsignmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ConsignmentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const consignment = await getConsignmentById(id);
  if (!consignment) {
    return {
      title: "Consignment Not Found",
    };
  }

  return {
    title: `${consignment.lrNumber} | Consignment`,
  };
}

export default async function ConsignmentDetailPage({
  params,
}: ConsignmentDetailPageProps) {
  const { id } = await params;
  const consignment = await getConsignmentById(id);

  if (!consignment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Consignment Note
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          {consignment.lrNumber}
        </h2>
        <p className="text-sm text-slate-500">
          Linked customer: {consignment.customer.name}
        </p>
      </div>

      <ConsignmentSummary consignment={consignment} />

      <section className="card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Remarks & GST
        </h3>
        <div className="mt-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">E-way Bill:</span>{" "}
            {consignment.ewayBillNumber ?? "Not provided"}
          </p>
          <p>
            <span className="font-semibold">Remarks:</span>{" "}
            {consignment.remarks ?? "—"}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            GST Note: GTA services under RCM require the recipient to pay GST.
            For FCM invoices, ensure tax components are captured while creating
            the invoice.
          </p>
        </div>
      </section>
    </div>
  );
}










