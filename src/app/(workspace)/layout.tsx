import { ReactNode } from "react";
import { getCompanyProfile, toLogoSrc } from "@/lib/company";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopBar } from "@/components/navigation/top-bar";
import { requireSession } from "@/lib/auth";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();
  const company = await getCompanyProfile();
  const companyLogo =
    "logoData" in company
      ? toLogoSrc(
          (company as typeof company & { logoData: string | null }).logoData
        )
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar firmName={company.firmName} userRole={session.role} />
      <div className="lg:pl-64">
        <TopBar
          firmName={company.firmName}
          address={company.address}
          phone={company.phone}
          username={session.username}
          role={session.role}
          logoSrc={companyLogo}
        />
        <main className="px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

