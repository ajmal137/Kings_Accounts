import Image from "next/image";
import Link from "next/link";
import { FilePlus2, NotebookPen } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { UserRole } from "@/types/auth";
import { MobileSidebar } from "./mobile-sidebar";

type TopBarProps = {
  firmName: string;
  address?: string | null;
  phone?: string | null;
  username: string;
  role: UserRole;
  logoSrc?: string | null;
};

export function TopBar({
  firmName,
  address,
  phone,
  username,
  role,
  logoSrc,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MobileSidebar firmName={firmName} userRole={role} />
          {logoSrc && (
            <div className="hidden h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:flex">
              <Image
                src={logoSrc}
                alt={`${firmName} logo`}
                width={56}
                height={56}
                className="h-full w-full object-contain"
                sizes="56px"
                unoptimized
              />
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Kings Transport
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {firmName}
            </h2>
            <p className="text-sm text-slate-500">
              {address ?? "Set address in Settings"} ·{" "}
              {phone ?? "Phone pending"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/consignments/new"
            className="inline-flex items-center gap-2 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            <NotebookPen className="h-4 w-4" />
            New Consignment
          </Link>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FilePlus2 className="h-4 w-4" />
            Create Invoice
          </Link>
          <div className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">{username}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {role === "ADMIN" ? "Administrator" : "Operator"}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

