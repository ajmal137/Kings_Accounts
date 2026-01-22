import { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in | Kings Transport",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-5xl grid gap-8 rounded-2xl bg-white p-8 shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Kings Transport
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Secure workspace access
          </h1>
          <p className="text-base text-slate-600">
            Sign in as an administrator or operator to access the transport
            dashboard, manage consignments, invoices, and accounting.
          </p>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>• Admins can configure system settings and manage data.</li>
            <li>• Operators can work on consignments, invoices, and reports.</li>
            <li>• Credentials are managed from the Settings screen.</li>
          </ul>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

