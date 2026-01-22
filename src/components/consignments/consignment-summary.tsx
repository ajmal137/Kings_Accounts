import { ConsignmentNote, Customer, Vehicle } from "@/generated/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import Link from "next/link";

type ConsignmentSummaryProps = {
  consignment: ConsignmentNote & { customer: Customer; vehicle: Vehicle };
};

export function ConsignmentSummary({ consignment }: ConsignmentSummaryProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Consignment
          </h3>
          <Link
            href={`/consignments/${consignment.id}/print`}
            className="text-sm font-medium text-blue-600"
          >
            Print LR
          </Link>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">LR Number</dt>
            <dd className="font-medium text-slate-900">{consignment.lrNumber}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Date</dt>
            <dd className="font-medium text-slate-900">
              {formatDate(consignment.date)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Payment Type</dt>
            <dd className="font-medium text-slate-900">
              {consignment.paymentType}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">GST Mode</dt>
            <dd className="font-medium text-slate-900">{consignment.gstMode}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Risk</dt>
            <dd className="font-medium text-slate-900">
              {consignment.ownerRiskOrCarrierRisk}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Freight</dt>
            <dd className="font-medium text-slate-900">
              {formatCurrency(Number(consignment.freightAmount))}
            </dd>
          </div>
        </dl>
      </div>
      <div className="card space-y-3 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Vehicle
        </h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Vehicle No.</dt>
            <dd className="font-medium text-slate-900">
              {consignment.vehicle.vehicleNumber}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Description</dt>
            <dd className="font-medium text-slate-900">
              {consignment.vehicle.description}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Owner</dt>
            <dd className="font-medium text-slate-900">
              {consignment.vehicle.ownerName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Owned by Firm</dt>
            <dd className="font-medium text-slate-900">
              {consignment.vehicle.isOwnedByFirm ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </div>
      <div className="card space-y-3 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Consignor
        </h3>
        <p className="text-sm text-slate-900">
          <span className="font-semibold">{consignment.consignorName}</span>
          <br />
          {consignment.consignorAddress}
          <br />
          GSTIN: {consignment.consignorGstin ?? "N/A"}
        </p>
      </div>
      <div className="card space-y-3 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Consignee
        </h3>
        <p className="text-sm text-slate-900">
          <span className="font-semibold">{consignment.consigneeName}</span>
          <br />
          {consignment.consigneeAddress}
          <br />
          GSTIN: {consignment.consigneeGstin ?? "N/A"}
        </p>
      </div>
    </div>
  );
}










