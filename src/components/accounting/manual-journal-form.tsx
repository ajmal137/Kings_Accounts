"use client";

import { useTransition, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LedgerEntryFormValues, ledgerEntrySchema } from "@/lib/validations";
import { createLedgerEntry } from "@/app/(workspace)/accounting/actions";
import { Account, Customer } from "@/generated/prisma";
import { Loader2 } from "lucide-react";

type ManualJournalFormProps = {
  accounts: Account[];
  customers: Customer[];
};

const DEBTORS_ACCOUNT_CODE = "AR-001";

export function ManualJournalForm({ accounts, customers }: ManualJournalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LedgerEntryFormValues>({
    resolver: zodResolver(ledgerEntrySchema) as Resolver<LedgerEntryFormValues>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      debitAccountId: "",
      creditAccountId: "",
      description: "",
      customerId: undefined,
    },
  });

  const debtorsAccountId = accounts.find(
    (account) => account.code === DEBTORS_ACCOUNT_CODE
  )?.id;

  const debitAccountId = watch("debitAccountId");
  const creditAccountId = watch("creditAccountId");
  const requiresCustomer =
    !!debtorsAccountId &&
    (debitAccountId === debtorsAccountId || creditAccountId === debtorsAccountId);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await createLedgerEntry(values);
      if (result?.success) {
        setMessage("Entry posted successfully.");
        reset({ date: new Date().toISOString().slice(0, 10) });
      } else if (result?.errors) {
        setMessage("Error: please review highlighted fields.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Manual Journal Entry
        </h3>
        <p className="text-sm text-slate-500">
          Use this when recording adjustments (fuel, expenses, etc.).
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            {...register("date")}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {errors.date && (
            <p className="text-xs text-red-600">{errors.date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {errors.amount && (
            <p className="text-xs text-red-600">{errors.amount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Debit Account
          </label>
          <select
            {...register("debitAccountId")}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.debitAccountId && (
            <p className="text-xs text-red-600">
              {errors.debitAccountId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Credit Account
          </label>
          <select
            {...register("creditAccountId")}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.creditAccountId && (
            <p className="text-xs text-red-600">
              {errors.creditAccountId.message}
            </p>
          )}
        </div>
        {requiresCustomer && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Customer (Sundry Debtors)
            </label>
            <select
              {...register("customerId", {
                setValueAs: (value) => value || undefined,
              })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-red-600">{errors.customerId.message}</p>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          rows={3}
          {...register("description")}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder="Diesel purchase, advance paid..."
        />
        {errors.description && (
          <p className="text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>
      {message && <p className="text-sm text-blue-600">{message}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Post Entry
        </button>
      </div>
    </form>
  );
}



