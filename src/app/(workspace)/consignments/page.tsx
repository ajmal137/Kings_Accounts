import { Metadata } from "next";
import Link from "next/link";
import { listConsignments } from "@/lib/consignments";
import { ConsignmentTable } from "@/components/consignments/consignment-table";

export const metadata: Metadata = {
  title: "Consignments | Kings Transport",
};

type ConsignmentsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ConsignmentsPage({
  searchParams,
}: ConsignmentsPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";

  const consignments = await listConsignments({
    query,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Consignment Register
          </h2>
          <p className="text-sm text-slate-500">
            Track LR / GR entries and drill down for printable receipts.
          </p>
        </div>
        <Link
          href="/consignments/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New Consignment
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by LR, consignor, consignee, route…"
          className="min-w-[240px] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Apply
        </button>
      </form>

      <ConsignmentTable consignments={consignments} />
    </div>
  );
}

