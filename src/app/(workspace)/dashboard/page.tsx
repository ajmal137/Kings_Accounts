import { Metadata } from "next";
import { getDashboardMetrics } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentConsignments } from "@/components/dashboard/recent-consignments";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { IndianRupee, Receipt, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Kings Transport",
};

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today's Consignments"
          value={String(metrics.todayConsignments)}
          helper="LRs created today"
          icon={<Truck className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="This Month's Freight"
          value={formatCurrency(metrics.monthFreight)}
          helper="Total freight billed"
          icon={<IndianRupee className="h-5 w-5 text-emerald-500" />}
          variant="success"
        />
        <StatCard
          title="Outstanding Invoices"
          value={formatCurrency(metrics.outstandingInvoices)}
          helper="Customer receivables"
          icon={<Receipt className="h-5 w-5 text-amber-500" />}
          variant="warning"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Consignments
            </h3>
            <p className="text-sm text-slate-500">
              The latest LR / GR entries captured in the system.
            </p>
          </div>
          <RecentConsignments consignments={metrics.recentConsignments} />
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Invoices
            </h3>
            <p className="text-sm text-slate-500">
              Quick view of GTA invoices raised.
            </p>
          </div>
          <RecentInvoices invoices={metrics.recentInvoices} />
        </div>
      </div>
    </div>
  );
}










