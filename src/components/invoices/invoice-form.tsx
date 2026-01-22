"use client";

import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Loader2 } from "lucide-react";
import { InvoiceFormValues, invoiceSchema } from "@/lib/validations";
import { INVOICE_TYPES } from "@/lib/options";
import { createInvoice } from "@/app/(workspace)/invoices/actions";
import { formatCurrency } from "@/lib/format";

type ConsignmentForForm = {
  id: string;
  lrNumber: string;
  fromLocation: string;
  toLocation: string;
};

type TaxSettingForForm = {
  fc5CgstRate: number;
  fc5SgstRate: number;
  fc18CgstRate: number;
  fc18SgstRate: number;
};

type InvoiceFormProps = {
  customers: Array<{ id: string; name: string }>;
  consignments: ConsignmentForForm[];
  taxSetting: TaxSettingForForm;
};

export function InvoiceForm({
  customers,
  consignments,
  taxSetting,
}: InvoiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      invoiceType: "GTA_RCM",
      basicAmount: 0,
      cgstRate: 0,
      sgstRate: 0,
      description: "",
      placeOfSupply: "Maharashtra",
    },
  });

  const invoiceType = useWatch({
    control,
    name: "invoiceType",
  }) as InvoiceFormValues["invoiceType"];
  const basicAmount = Number(
    useWatch({ control, name: "basicAmount" }) || 0
  );
  const cgstRate = Number(useWatch({ control, name: "cgstRate" }) || 0);
  const sgstRate = Number(useWatch({ control, name: "sgstRate" }) || 0);

  useEffect(() => {
    if (invoiceType === "GTA_RCM") {
      setValue("cgstRate", 0);
      setValue("sgstRate", 0);
    } else if (invoiceType === "GTA_FCM_5") {
      setValue("cgstRate", Number(taxSetting.fc5CgstRate));
      setValue("sgstRate", Number(taxSetting.fc5SgstRate));
    } else {
      setValue("cgstRate", Number(taxSetting.fc18CgstRate));
      setValue("sgstRate", Number(taxSetting.fc18SgstRate));
    }
  }, [invoiceType, setValue, taxSetting]);

  const cgstAmount = (basicAmount * cgstRate) / 100;
  const sgstAmount = (basicAmount * sgstRate) / 100;
  const totalAmount = basicAmount + cgstAmount + sgstAmount;

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        await createInvoice(values);
      } catch (err) {
        console.error(err);
        setError("Failed to create invoice. Please try again.");
      }
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Customer & Consignment
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Invoice Date
            </label>
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
              Customer
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
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Link Consignment (optional)
            </label>
            <select
              {...register("consignmentNoteId")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select LR</option>
              {consignments.map((consignment) => (
                <option key={consignment.id} value={consignment.id}>
                  {consignment.lrNumber} · {consignment.fromLocation} →{" "}
                  {consignment.toLocation}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Invoice Details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Invoice Type
            </label>
            <select
              {...register("invoiceType")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {INVOICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace("GTA_", "GTA ").replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Place of Supply
            </label>
            <input
              {...register("placeOfSupply")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              {...register("description")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Freight for transport from Pune to Mumbai as per LR..."
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Amounts & Taxes
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Basic Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("basicAmount", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            {errors.basicAmount && (
              <p className="text-xs text-red-600">
                {errors.basicAmount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              CGST Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("cgstRate", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              SGST Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("sgstRate", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              {...register("notes")}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Include declarations or payment terms…"
            />
          </div>
        </div>
        <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold">CGST:</span>{" "}
            {formatCurrency(cgstAmount)}
          </p>
          <p>
            <span className="font-semibold">SGST:</span>{" "}
            {formatCurrency(sgstAmount)}
          </p>
          <p className="text-base font-semibold text-slate-900">
            Total: {formatCurrency(totalAmount)}
          </p>
          {invoiceType === "GTA_RCM" ? (
            <p className="text-xs text-slate-500">
              GST payable by recipient under Reverse Charge Mechanism.
            </p>
          ) : invoiceType === "GTA_FCM_5" ? (
            <p className="text-xs text-slate-500">
              5% FCM selected – No ITC available to supplier for this option.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              18% FCM selected – ITC available to supplier.
            </p>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Invoice
        </button>
      </div>
    </form>
  );
}

