"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { Account, Customer } from "@/generated/prisma";
import { createLedgerEntry } from "@/app/(workspace)/accounting/actions";
import { Loader2 } from "lucide-react";

type PaymentEntryFormProps = {
  accounts: Account[];
  cashBankAccounts: Account[];
  customers: Customer[];
};

export function PaymentEntryForm({
  accounts,
  cashBankAccounts,
  customers,
}: PaymentEntryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counterpartyAccountId, setCounterpartyAccountId] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const debtorsAccountId = accounts.find((account) => account.code === "AR-001")?.id;
  const requiresCustomer = debtorsAccountId === counterpartyAccountId && !!debtorsAccountId;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const date = (formData.get("date") as string) ?? "";
    const amount = Number(formData.get("amount"));
    const paymentAccountId =
      (formData.get("paymentAccountId") as string) ?? "";
    const destinationAccountId =
      (formData.get("destinationAccountId") as string) ?? "";
    const customerId =
      ((formData.get("customerId") as string) ?? "").trim() || undefined;
    const description =
      ((formData.get("description") as string) ?? "").trim() ||
      "Payment posted";

    if (!date || !amount || !paymentAccountId || !destinationAccountId) {
      setError("Please complete all fields.");
      setMessage(null);
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount greater than zero.");
      setMessage(null);
      return;
    }

    if (requiresCustomer && !customerId) {
      setError("Select customer for Sundry Debtors entry.");
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
        debitAccountId: destinationAccountId,
        creditAccountId: paymentAccountId,
        customerId: requiresCustomer ? customerId : undefined,
      });

      if (result?.success) {
        setMessage("Payment recorded.");
        formRef.current?.reset();
        setCounterpartyAccountId("");
      } else {
        setError("Unable to save payment. Please try again.");
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
        <h3 className="text-lg font-semibold text-slate-900">Payment Entry</h3>
        <p className="text-sm text-slate-500">
          Record expenses, vendor payments, or cash withdrawals.
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
            Paid From
          </label>
          <select
            name="paymentAccountId"
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
            Paid To
          </label>
          <select
            name="destinationAccountId"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
            onChange={(event) => setCounterpartyAccountId(event.target.value)}
          >
            <option value="">Select counterparty</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        {requiresCustomer && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Customer (Sundry Debtors)
            </label>
            <select
              name="customerId"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Payment narration"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Payment
        </button>
      </div>
    </form>
  );
}




