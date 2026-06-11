import { notFound } from "next/navigation";
import { getConsignmentById } from "@/lib/consignments";
import { getCustomers, getVehicles } from "@/lib/masters";
import { ConsignmentForm } from "@/components/consignments/consignment-form";
import { AdminAuthCard } from "@/components/auth/admin-auth-card";
import { verifyAdminPasswordAction } from "@/app/actions/auth";

type EditConsignmentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pw?: string }>;
};

export default async function EditConsignmentPage({
  params,
  searchParams,
}: EditConsignmentPageProps) {
  const { id } = await params;
  const { pw } = await searchParams;

  const consignment = await getConsignmentById(id);
  if (!consignment) {
    notFound();
  }

  // Verify password if provided
  let isAuthorized = false;
  if (pw) {
    const verification = await verifyAdminPasswordAction(pw);
    isAuthorized = verification.success;
  }

  if (!isAuthorized) {
    return (
      <AdminAuthCard
        title="Authorized Access Required"
        description={`Please enter the admin password to edit Lorry Receipt ${consignment.lrNumber}.`}
      />
    );
  }

  const [customers, vehicles] = await Promise.all([
    getCustomers(),
    getVehicles(),
  ]);

  const safeConsignment = {
    ...consignment,
    weight: Number(consignment.weight),
    freightAmount: Number(consignment.freightAmount),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Edit Consignment Note: {consignment.lrNumber}
        </h2>
        <p className="text-sm text-slate-500">
          Modify details for this Lorry Receipt. Changes will be saved securely.
        </p>
      </div>
      <ConsignmentForm
        customers={customers}
        vehicles={vehicles}
        initialData={safeConsignment as any}
        adminPassword={pw}
      />
    </div>
  );
}
