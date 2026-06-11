import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCustomers } from "@/lib/masters";
import { getTaxSetting } from "@/lib/tax";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { AdminAuthCard } from "@/components/auth/admin-auth-card";
import { verifyAdminPasswordAction } from "@/app/actions/auth";
import { getCompanyProfile } from "@/lib/company";

type EditInvoicePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pw?: string }>;
};

export default async function EditInvoicePage({
  params,
  searchParams,
}: EditInvoicePageProps) {
  const { id } = await params;
  const { pw } = await searchParams;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
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
        description={`Please enter the admin password to edit Invoice ${invoice.invoiceNumber}.`}
      />
    );
  }

  const [customers, consignments, taxSetting, company] = await Promise.all([
    getCustomers(),
    prisma.consignmentNote.findMany({
      orderBy: { date: "desc" },
      take: 50,
    }),
    getTaxSetting(),
    getCompanyProfile(),
  ]);

  const safeConsignments = consignments.map((c) => ({
    ...c,
    weight: Number(c.weight),
    freightAmount: Number(c.freightAmount),
  }));

  const safeTaxSetting = {
    fc5CgstRate: Number(taxSetting.fc5CgstRate),
    fc5SgstRate: Number(taxSetting.fc5SgstRate),
    fc18CgstRate: Number(taxSetting.fc18CgstRate),
    fc18SgstRate: Number(taxSetting.fc18SgstRate),
  };

  const safeInvoice = {
    ...invoice,
    basicAmount: Number(invoice.basicAmount),
    cgstRate: Number(invoice.cgstRate),
    sgstRate: Number(invoice.sgstRate),
    cgstAmount: Number(invoice.cgstAmount),
    sgstAmount: Number(invoice.sgstAmount),
    totalAmount: Number(invoice.totalAmount),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Edit GTA Invoice: {invoice.invoiceNumber}
        </h2>
        <p className="text-sm text-slate-500">
          Modify details for this GTA Invoice. Ledger entries will be automatically re-calculated.
        </p>
      </div>
      <InvoiceForm
        customers={customers}
        consignments={safeConsignments}
        taxSetting={safeTaxSetting}
        initialData={safeInvoice as any}
        adminPassword={pw}
        invoicePrefix={company.invoicePrefix}
      />
    </div>
  );
}
