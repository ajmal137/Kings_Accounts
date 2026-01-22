"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { consignmentSchema, ConsignmentFormValues } from "@/lib/validations";
import {
  GST_MODES,
  PAYMENT_TYPES,
  RISK_TYPES,
} from "@/lib/options";
import { createConsignment } from "@/app/(workspace)/consignments/actions";
import { Customer, Vehicle } from "@/generated/prisma";

type ConsignmentFormProps = {
  customers: Customer[];
  vehicles: Vehicle[];
};

export function ConsignmentForm({ customers, vehicles }: ConsignmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsignmentFormValues>({
    resolver: zodResolver(consignmentSchema) as Resolver<ConsignmentFormValues>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      paymentType: "PAID",
      gstMode: "RCM",
      ownerRiskOrCarrierRisk: "CARRIER_RISK",
      numPackages: 1,
      weight: 1,
      freightAmount: 0,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        await createConsignment(values);
      } catch (err) {
        console.error(err);
        setError("Failed to create consignment. Please try again.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Consignment Details
        </h3>
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
              Billing Customer
            </label>
            <select
              {...register("customerId")}
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
              <p className="text-xs text-red-600">
                {errors.customerId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Vehicle
            </label>
            <select
              {...register("vehicleId")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleNumber} · {vehicle.description}
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-xs text-red-600">
                {errors.vehicleId.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Consignor & Consignee
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Consignor Name
            </label>
            <input
              {...register("consignorName")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            {errors.consignorName && (
              <p className="text-xs text-red-600">
                {errors.consignorName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Consignor GSTIN
            </label>
            <input
              {...register("consignorGstin")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Consignor Address
            </label>
            <textarea
              rows={2}
              {...register("consignorAddress")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Consignee Name
            </label>
            <input
              {...register("consigneeName")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            {errors.consigneeName && (
              <p className="text-xs text-red-600">
                {errors.consigneeName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Consignee GSTIN
            </label>
            <input
              {...register("consigneeGstin")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Consignee Address
            </label>
            <textarea
              rows={2}
              {...register("consigneeAddress")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Freight & Goods
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              From Location
            </label>
            <input
              {...register("fromLocation")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              To Location
            </label>
            <input
              {...register("toLocation")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Goods Description
            </label>
            <textarea
              rows={2}
              {...register("goodsDescription")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Packages
            </label>
            <input
              type="number"
              {...register("numPackages", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Weight (MT)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("weight", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Freight Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("freightAmount", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Payment Type
            </label>
            <select
              {...register("paymentType")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {PAYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              GST Mode
            </label>
            <select
              {...register("gstMode")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {GST_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Risk
            </label>
            <select
              {...register("ownerRiskOrCarrierRisk")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {RISK_TYPES.map((risk) => (
                <option key={risk} value={risk}>
                  {risk.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              E-way Bill
            </label>
            <input
              {...register("ewayBillNumber")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Remarks</label>
          <textarea
            rows={2}
            {...register("remarks")}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Consignment
        </button>
      </div>
    </form>
  );
}

