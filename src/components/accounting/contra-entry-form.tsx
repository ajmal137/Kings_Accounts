"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { Account } from "@/generated/prisma";
import { createLedgerEntry } from "@/app/(workspace)/accounting/actions";
import { Loader2 } from "lucide-react";

type ContraEntryFormProps = {
  cashBankAccounts: Account[];
};

export function ContraEntryForm({ cashBankAccounts }: ContraEntryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const date = (formData.get("date") as string) ?? "";
    const amount = Number(formData.get("amount"));
    const fromAccountId = (formData.get("fromAccountId") as string) ?? "";
    const toAccountId = (formData.get("toAccountId") as string) ?? "";
    const description =
      ((formData.get("description") as string) ?? "").trim() ||
      "Contra entry posted";

    if (!date || !amount || !fromAccountId || !toAccountId) {
      setError("Please complete all fields.");
      setMessage(null);
      return;
    }

    if (fromAccountId === toAccountId) {
      setError("Select two different cash / bank accounts.");
      setMessage(null);
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount greater than zero.");
      setMessage(null);
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await createLedgerEntry({
        date,
        description,
        amount,
        debitAccountId: toAccountId,
        creditAccountId: fromAccountId,
        customerId: undefined,
      });

      if (result?.success) {
        setMessage("Contra entry recorded.");
        formRef.current?.reset();
      } else {
        setError("Unable to save contra entry. Please try again.");
      }
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="card space-y-4 p-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Contra Entry</h3>
        <p className="text-sm text-slate-500">
          Transfer between cash and bank (cash deposits, bank withdrawals, etc.).
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={today}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Amount (₹)
          </label>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Transfer From
          </label>
          <select
            name="fromAccountId"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
          >
            <option value="">Select cash / bank</option>
            {cashBankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Transfer To
          </label>
          <select
            name="toAccountId"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
          >
            <option value="">Select cash / bank</option>
            {cashBankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Contra narration"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Contra
        </button>
      </div>
    </form>
  );
}




