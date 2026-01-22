import { ConsignmentNote, Customer, Vehicle } from "@/generated/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

type RecentConsignmentsProps = {
  consignments: Array<
    ConsignmentNote & { customer: Customer; vehicle: Vehicle }
  >;
};

export function RecentConsignments({
  consignments,
}: RecentConsignmentsProps) {
  if (consignments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No consignments yet. Create your first LR to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">LR No.</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3 text-right">Freight</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {consignments.map((consignment) => (
            <tr key={consignment.id} className="text-slate-700">
              <td className="px-4 py-3 font-medium">{consignment.lrNumber}</td>
              <td className="px-4 py-3">{formatDate(consignment.date)}</td>
              <td className="px-4 py-3">{consignment.customer.name}</td>
              <td className="px-4 py-3">{consignment.vehicle.vehicleNumber}</td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(Number(consignment.freightAmount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}










