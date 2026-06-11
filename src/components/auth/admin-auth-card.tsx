"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { verifyAdminPasswordAction } from "@/app/actions/auth";

type AdminAuthCardProps = {
  title?: string;
  description?: string;
};

export function AdminAuthCard({
  title = "Admin Authorization Required",
  description = "Please enter the admin password to continue.",
}: AdminAuthCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required.");
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const result = await verifyAdminPasswordAction(password);
      if (result.success) {
        // Redirect with pw query param
        router.push(`${pathname}?pw=${encodeURIComponent(password)}`);
      } else {
        setError(result.message ?? "Incorrect admin password.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-blue-50 p-3 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="admin-password"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
