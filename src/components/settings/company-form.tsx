"use client";

import {
  useTransition,
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
} from "react";
import { CompanyProfile } from "@/generated/prisma";
import { updateCompanyProfile } from "@/app/(workspace)/settings/actions";
import { Loader2, ImageIcon } from "lucide-react";

type CompanyProfileWithLogo = CompanyProfile & {
  logoData?: string | null;
};

type CompanyFormProps = {
  profile: CompanyProfileWithLogo;
};

export function CompanyForm({ profile }: CompanyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    profile.logoData ?? null
  );
  const [logoCleared, setLogoCleared] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLogoCleared(false);
    setError(null);

    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setLogoPreview(nextUrl);
  };

  const handleLogoClear = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLogoPreview(null);
    setLogoCleared(true);
    setError(null);
  };

  const handleSubmit = (formData: FormData) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateCompanyProfile(formData);
      if (result?.success) {
        setMessage("Company profile saved.");
        if (typeof result.logoData !== "undefined") {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            setObjectUrl(null);
          }
          setLogoPreview(result.logoData);
          setLogoCleared(false);
        }
      } else {
        setError(result?.error ?? "Failed to save profile.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="card space-y-4 p-6">
      <input type="hidden" name="logoClear" value={logoCleared ? "1" : ""} />
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Company Profile
        </h3>
        <p className="text-sm text-slate-500">
          Details appear on invoices and LR printouts.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Firm Name
          </label>
          <input
            name="firmName"
            defaultValue={profile.firmName}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">GSTIN</label>
          <input
            name="gstin"
            defaultValue={profile.gstin ?? ""}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <input
            name="phone"
            defaultValue={profile.phone ?? ""}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            defaultValue={profile.email ?? ""}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            type="email"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Invoice Prefix
          </label>
          <input
            name="invoicePrefix"
            defaultValue={profile.invoicePrefix}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            LR Prefix
          </label>
          <input
            name="lrPrefix"
            defaultValue={profile.lrPrefix}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Address</label>
        <textarea
          name="address"
          rows={3}
          defaultValue={profile.address ?? ""}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Company Logo
        </label>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="Company logo preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <ImageIcon className="h-6 w-6" />
                <span className="mt-1 text-xs">No logo</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              name="logoFile"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
            />
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={handleLogoClear}
                disabled={!logoPreview}
                className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove logo
              </button>
              <p className="text-xs text-slate-500">
                PNG, JPG, SVG, or WebP up to 2MB.
              </p>
            </div>
          </div>
        </div>
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Profile
        </button>
      </div>
    </form>
  );
}

