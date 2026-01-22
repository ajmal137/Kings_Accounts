"use client";

import { useState, useTransition } from "react";
import { Vehicle } from "@/generated/prisma";
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/app/(workspace)/masters/actions";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";

type VehicleManagerProps = {
  vehicles: Vehicle[];
};

const emptyVehicle = {
  vehicleNumber: "",
  description: "",
  ownerName: "",
  isOwnedByFirm: false,
};

export function VehicleManager({ vehicles }: VehicleManagerProps) {
  const [form, setForm] = useState(emptyVehicle);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createVehicle(form);
      if (result?.success) {
        setForm(emptyVehicle);
      }
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Vehicles</h3>
        <p className="text-sm text-slate-500">
          Maintain owned / hired vehicles for LR creation.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="card grid gap-3 rounded-xl p-4 md:grid-cols-2"
      >
        <input
          required
          placeholder="Vehicle number"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.vehicleNumber}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))
          }
        />
        <input
          placeholder="Description"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <input
          required
          placeholder="Owner name"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.ownerName}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, ownerName: e.target.value }))
          }
        />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={form.isOwnedByFirm}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isOwnedByFirm: e.target.checked }))
            }
          />
          Owned by firm
        </label>
        <div className="flex justify-end md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Vehicle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Vehicle No.</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Owned</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((vehicle) => (
              <VehicleRow key={vehicle.id} vehicle={vehicle} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    vehicleNumber: vehicle.vehicleNumber,
    description: vehicle.description ?? "",
    ownerName: vehicle.ownerName,
    isOwnedByFirm: vehicle.isOwnedByFirm,
  });
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await updateVehicle({ id: vehicle.id, ...form });
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this vehicle?")) return;
    startTransition(async () => {
      await deleteVehicle(vehicle.id);
    });
  };

  return (
    <tr className="text-slate-700">
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.vehicleNumber}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))
            }
          />
        ) : (
          <span className="font-medium">{vehicle.vehicleNumber}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        ) : (
          vehicle.description ?? "—"
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={form.ownerName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, ownerName: e.target.value }))
            }
          />
        ) : (
          vehicle.ownerName
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            type="checkbox"
            checked={form.isOwnedByFirm}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isOwnedByFirm: e.target.checked }))
            }
          />
        ) : vehicle.isOwnedByFirm ? (
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
                  vehicleNumber: vehicle.vehicleNumber,
                  description: vehicle.description ?? "",
                  ownerName: vehicle.ownerName,
                  isOwnedByFirm: vehicle.isOwnedByFirm,
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










