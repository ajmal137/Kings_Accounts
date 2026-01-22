"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteLedgerEntry } from "@/app/(workspace)/accounting/actions";
import { Loader2, Trash2 } from "lucide-react";

type DeleteEntryButtonProps = {
  entryId: string;
};

export function DeleteEntryButton({ entryId }: DeleteEntryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    const adminPassword = window.prompt(
      "Enter admin password to delete this transaction:"
    );

    if (!adminPassword) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteLedgerEntry({
        entryId,
        adminPassword,
      });

      if (result?.success) {
        setError(null);
        router.refresh();
      } else {
        setError(result?.message ?? "Unable to delete entry.");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        Delete
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}











