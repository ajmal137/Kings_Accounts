"use client";

import { useState, useTransition } from "react";
import { Account } from "@/generated/prisma";
import {
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/app/(workspace)/masters/actions";
import { ACCOUNT_TYPES } from "@/lib/options";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";

type AccountManagerProps = {
  accounts: Account[];
};

const emptyAccount = {
  name: "",
  code: "",
  type: "ASSET",
};

export function AccountManager({ accounts }: AccountManagerProps) {
  const [form, setForm] = useState(emptyAccount);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createAccount(form);
      if (result?.success) {
        setForm(emptyAccount);
      }
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Ledger Accounts</h3>
        <p className="text-sm text-slate-500">
          Chart of accounts used in ledger entries and reports.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="card grid gap-3 rounded-xl p-4 md:grid-cols-3"
      >
        <input
          required
          placeholder="Account name"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <input
          required
          placeholder="Code"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.code}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, code: e.target.value }))
          }
        />
        <select
          value={form.type}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, type: e.target.value }))
          }
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="flex justify-end md:col-span-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Account
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AccountRow({ account }: { account: Account }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: account.name,
    code: account.code,
    type: account.type,
  });
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await updateAccount({ id: account.id, ...form });
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this account?")) return;
    startTransition(async () => {
      await deleteAccount(account.id);
    });
  };

  return (
    <tr className="text-slate-700">
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        ) : (
          <span className="font-medium">{account.name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.code}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, code: e.target.value }))
            }
          />
        ) : (
          account.code
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <select
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        ) : (
          account.type
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-md border border-emerald-500 px-2 py-1 text-xs text-emerald-600"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm({
                  name: account.name,
                  code: account.code,
                  type: account.type,
                });
              }}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}










