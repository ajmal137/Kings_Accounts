"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateUserCredentials } from "@/app/(workspace)/settings/actions";

type CredentialsFormProps = {
  adminUsername?: string;
  userUsername?: string;
};

export function CredentialsForm({
  adminUsername = "",
  userUsername = "",
}: CredentialsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setMessage(null);
    setError(null);

    const adminUsernameValue = (formData.get("adminUsername") as string) ?? "";
    const adminPasswordValue = (formData.get("adminPassword") as string) ?? "";
    const userUsernameValue = (formData.get("userUsername") as string) ?? "";
    const userPasswordValue = (formData.get("userPassword") as string) ?? "";

    startTransition(async () => {
      const result = await updateUserCredentials({
        adminUsername: adminUsernameValue,
        adminPassword: adminPasswordValue,
        userUsername: userUsernameValue,
        userPassword: userPasswordValue,
      });

      if (result?.success) {
        setMessage("Credential details saved.");
      } else {
        setError("Unable to save credentials. Please check the inputs.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="card space-y-4 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">User Access</h3>
        <p className="text-sm text-slate-500">
          Create or update the admin and operator accounts used to access the
          system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Admin Account</p>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">
              Username
            </label>
            <input
              name="adminUsername"
              defaultValue={adminUsername}
              autoComplete="username"
              minLength={3}
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">
              Password
            </label>
            <input
              type="password"
              name="adminPassword"
              placeholder="Enter a new password"
              minLength={6}
              autoComplete="new-password"
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">User Account</p>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">
              Username
            </label>
            <input
              name="userUsername"
              defaultValue={userUsername}
              autoComplete="username"
              minLength={3}
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">
              Password
            </label>
            <input
              type="password"
              name="userPassword"
              placeholder="Enter a new password"
              minLength={6}
              autoComplete="new-password"
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Passwords must be at least 6 characters. They are stored securely using
        hashing and cannot be retrieved later.
      </p>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Access
        </button>
      </div>
    </form>
  );
}

