"use client";

import { useTransition, useState } from "react";
import { updateTaxSetting } from "@/app/(workspace)/settings/actions";
import { Loader2 } from "lucide-react";

type TaxFormData = {
  id: number;
  fc5CgstRate: number;
  fc5SgstRate: number;
  fc18CgstRate: number;
  fc18SgstRate: number;
  updatedAt: string;
};

type TaxFormProps = {
  tax: TaxFormData;
};

export function TaxForm({ tax }: TaxFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    startTransition(async () => {
      const result = await updateTaxSetting({
        fc5CgstRate: data.fc5CgstRate,
        fc5SgstRate: data.fc5SgstRate,
        fc18CgstRate: data.fc18CgstRate,
        fc18SgstRate: data.fc18SgstRate,
      });
      if (result?.success) {
        setMessage("Tax settings saved.");
      } else {
        setMessage("Failed to save tax settings.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="card space-y-4 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">GST Settings</h3>
        <p className="text-sm text-slate-500">
          Update default rates used in GTA FCM invoices.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            FCM 5% CGST
          </label>
          <input
            type="number"
            step="0.1"
            name="fc5CgstRate"
            defaultValue={tax.fc5CgstRate}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            FCM 5% SGST
          </label>
          <input
            type="number"
            step="0.1"
            name="fc5SgstRate"
            defaultValue={tax.fc5SgstRate}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            FCM 18% CGST
          </label>
          <input
            type="number"
            step="0.1"
            name="fc18CgstRate"
            defaultValue={tax.fc18CgstRate}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            FCM 18% SGST
          </label>
          <input
            type="number"
            step="0.1"
            name="fc18SgstRate"
            defaultValue={tax.fc18SgstRate}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      {message && <p className="text-sm text-blue-600">{message}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save GST Settings
        </button>
      </div>
    </form>
  );
}

