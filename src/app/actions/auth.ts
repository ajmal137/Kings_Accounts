"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  createSession,
  destroySession,
} from "@/lib/auth";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

export async function verifyAdminPasswordAction(password: string): Promise<{ success: boolean; message?: string }> {
  if (!password) {
    return { success: false, message: "Password is required." };
  }

  const admin = await prisma.userCredential.findUnique({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    return { success: false, message: "Admin credentials are not configured." };
  }

  const isValid = await compare(password, admin.passwordHash);
  return {
    success: isValid,
    message: isValid ? undefined : "Incorrect admin password.",
  };
}


