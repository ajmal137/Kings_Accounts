"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { verifyAdminPasswordAction } from "@/app/actions/auth";
import { Loader2, Edit } from "lucide-react";

type EditInvoiceButtonProps = {
  invoiceId: string;
};

export function EditInvoiceButton({ invoiceId }: EditInvoiceButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    const adminPassword = window.prompt(
      "Enter admin password to edit this invoice."
    );

    if (!adminPassword) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await verifyAdminPasswordAction(adminPassword);

      if (result.success) {
        setError(null);
        router.push(
          `/invoices/${invoiceId}/edit?pw=${encodeURIComponent(adminPassword)}`
        );
      } else {
        setError(result.message ?? "Unable to verify admin password.");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleEdit}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Edit className="h-3.5 w-3.5" />
        )}
        Edit
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
