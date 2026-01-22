import { Metadata } from "next";
import { ConsignmentForm } from "@/components/consignments/consignment-form";
import { getCustomers, getVehicles } from "@/lib/masters";

export const metadata: Metadata = {
  title: "New Consignment | Kings Transport",
};

export default async function NewConsignmentPage() {
  const [customers, vehicles] = await Promise.all([
    getCustomers(),
    getVehicles(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          New Consignment Note
        </h2>
        <p className="text-sm text-slate-500">
          Capture consignor/consignee details and freight to generate an LR
          number automatically.
        </p>
      </div>
      <ConsignmentForm customers={customers} vehicles={vehicles} />
    </div>
  );
}










