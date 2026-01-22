import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "@/components/settings/company-form";
import { TaxForm } from "@/components/settings/tax-form";
import { CredentialsForm } from "@/components/settings/credentials-form";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings | Kings Transport",
};

export default async function SettingsPage() {
  await requireAdminSession();
  const [company, tax, credentials] = await Promise.all([
    prisma.companyProfile.findUnique({ where: { id: 1 } }),
    prisma.taxSetting.findUnique({ where: { id: 1 } }),
    prisma.userCredential.findMany({
      where: { role: { in: ["ADMIN", "USER"] } },
    }),
  ]);

  if (!company || !tax) {
    throw new Error("Seed data missing. Run npm run db:seed.");
  }

  const taxPlain = {
    id: tax.id,
    fc5CgstRate: tax.fc5CgstRate.toNumber(),
    fc5SgstRate: tax.fc5SgstRate.toNumber(),
    fc18CgstRate: tax.fc18CgstRate.toNumber(),
    fc18SgstRate: tax.fc18SgstRate.toNumber(),
    updatedAt: tax.updatedAt.toISOString(),
  };

  const adminCredential = credentials.find((cred) => cred.role === "ADMIN");
  const userCredential = credentials.find((cred) => cred.role === "USER");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">
          Update company profile, print headers, and GST defaults.
        </p>
      </div>
      <CompanyForm profile={company} />
      <TaxForm tax={taxPlain} />
      <CredentialsForm
        adminUsername={adminCredential?.username}
        userUsername={userCredential?.username}
      />
    </div>
  );
}

