"use client";

import { useState, useTransition } from "react";
import { Customer } from "@/generated/prisma";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/(workspace)/masters/actions";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";

type CustomerManagerProps = {
  customers: Customer[];
};

const emptyForm = {
  name: "",
  address: "",
  gstin: "",
  contactPhone: "",
  contactEmail: "",
  isRegistered: true,
};

export function CustomerManager({ customers }: CustomerManagerProps) {
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createCustomer(form);
      if (result?.success) {
        setForm(emptyForm);
        setMessage("Customer added.");
      } else {
        setMessage("Failed to add customer.");
      }
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Customers</h3>
        <p className="text-sm text-slate-500">
          Add consignor/consignee accounts used for billing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card grid gap-3 rounded-xl p-4 md:grid-cols-2"
      >
        <input
          required
          placeholder="Customer name"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          required
          placeholder="Phone"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.contactPhone}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, contactPhone: e.target.value }))
          }
        />
        <input
          placeholder="GSTIN"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.gstin}
          onChange={(e) => setForm((prev) => ({ ...prev, gstin: e.target.value }))}
        />
        <input
          placeholder="Email"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.contactEmail}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, contactEmail: e.target.value }))
          }
        />
        <textarea
          required
          placeholder="Billing address"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm md:col-span-2"
          value={form.address}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, address: e.target.value }))
          }
        />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={form.isRegistered}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isRegistered: e.target.checked }))
            }
          />
          Registered (GST)
        </label>
        <div className="flex justify-end md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Customer
          </button>
        </div>
        {message && (
          <p className="text-sm text-blue-600 md:col-span-2">{message}</p>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">GSTIN</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CustomerRow({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: customer.name,
    address: customer.address,
    gstin: customer.gstin ?? "",
    contactPhone: customer.contactPhone,
    contactEmail: customer.contactEmail ?? "",
    isRegistered: customer.isRegistered,
  });
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await updateCustomer({ id: customer.id, ...form });
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this customer?")) return;
    startTransition(async () => {
      await deleteCustomer(customer.id);
    });
  };

  return (
    <tr className="text-slate-700">
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        ) : (
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-xs text-slate-500">{customer.address}</p>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.gstin}
            onChange={(e) => setForm((prev) => ({ ...prev, gstin: e.target.value }))}
          />
        ) : (
          customer.gstin || "—"
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.contactPhone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, contactPhone: e.target.value }))
            }
          />
        ) : (
          <>
            <p>{customer.contactPhone}</p>
            {customer.contactEmail && (
              <p className="text-xs text-slate-500">{customer.contactEmail}</p>
            )}
          </>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            type="checkbox"
            checked={form.isRegistered}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isRegistered: e.target.checked }))
            }
          />
        ) : customer.isRegistered ? (
          "Yes"
        ) : (
          "No"
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
                  name: customer.name,
                  address: customer.address,
                  gstin: customer.gstin ?? "",
                  contactPhone: customer.contactPhone,
                  contactEmail: customer.contactEmail ?? "",
                  isRegistered: customer.isRegistered,
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










