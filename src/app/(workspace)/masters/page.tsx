import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CustomerManager } from "@/components/masters/customer-manager";
import { VehicleManager } from "@/components/masters/vehicle-manager";
import { AccountManager } from "@/components/masters/account-manager";

export const metadata: Metadata = {
  title: "Masters | Kings Transport",
};

export default async function MastersPage() {
  const [customers, vehicles, accounts] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { vehicleNumber: "asc" } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Master Data</h2>
        <p className="text-sm text-slate-500">
          Maintain customers, vehicles, and ledger accounts used throughout the
          app.
        </p>
      </div>
      <CustomerManager customers={customers} />
      <VehicleManager vehicles={vehicles} />
      <AccountManager accounts={accounts} />
    </div>
  );
}










