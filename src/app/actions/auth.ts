"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  createSession,
  destroySession,
} from "@/lib/auth";

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!username || !password) {
    return { error: "Enter both username and password." };
  }

  const user = await authenticateUser(username, password);

  if (!user) {
    return { error: "Invalid username or password." };
  }

  await createSession(user);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

