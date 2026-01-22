"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { loginAction, type LoginFormState } from "@/app/actions/auth";

export function LoginForm() {
  const initialState: LoginFormState = {};
  const [state, formAction] = useActionState<LoginFormState, FormData>(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="card w-full max-w-md space-y-6 p-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Kings Transport
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-500">
          Use the admin or operator credentials configured in Settings.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          minLength={3}
          required
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={6}
          required
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

