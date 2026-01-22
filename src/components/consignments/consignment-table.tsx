import { ConsignmentNote, Customer, Vehicle } from "@/generated/prisma";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { DeleteConsignmentButton } from "./delete-consignment-button";

type ConsignmentTableProps = {
  consignments: Array<
    ConsignmentNote & { customer: Customer | null; vehicle: Vehicle | null }
  >;
};

export function ConsignmentTable({ consignments }: ConsignmentTableProps) {
  if (!consignments.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No consignments found. Create a new LR to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">LR Number</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3 text-right">Freight</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {consignments.map((consignment) => (
            <tr key={consignment.id} className="text-slate-700">
              <td className="px-4 py-3 font-medium">
                <Link
                  href={`/consignments/${consignment.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {consignment.lrNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{formatDate(consignment.date)}</td>
              <td className="px-4 py-3">
                {consignment.customer?.name ?? "—"}
              </td>
              <td className="px-4 py-3">
                {consignment.fromLocation} → {consignment.toLocation}
              </td>
              <td className="px-4 py-3">
                {consignment.vehicle?.vehicleNumber ?? "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(Number(consignment.freightAmount))}
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteConsignmentButton consignmentId={consignment.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

