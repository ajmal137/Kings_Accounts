"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";
import { requireAdminSession } from "@/lib/auth";

const companySchema = z.object({
  firmName: z.string().min(3),
  address: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  invoicePrefix: z.string().min(2),
  lrPrefix: z.string().min(2),
  invoiceRcmDeclaration: z.string().min(3),
  invoiceFcmDeclaration: z.string().min(3),
  lrRcmDeclaration: z.string().min(3),
  lrFcmDeclaration: z.string().min(3),
});

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

const taxSchema = z.object({
  fc5CgstRate: z.coerce.number().min(0).max(9),
  fc5SgstRate: z.coerce.number().min(0).max(9),
  fc18CgstRate: z.coerce.number().min(0).max(18),
  fc18SgstRate: z.coerce.number().min(0).max(18),
});

const credentialsSchema = z.object({
  adminUsername: z.string().min(3),
  adminPassword: z.string().min(6),
  userUsername: z.string().min(3),
  userPassword: z.string().min(6),
});

export async function updateCompanyProfile(formData: FormData) {
  await requireAdminSession();

  const requiredString = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const optionalString = (key: string) => {
    const value = formData.get(key);
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const payload = {
    firmName: requiredString("firmName"),
    address: optionalString("address"),
    gstin: optionalString("gstin"),
    phone: optionalString("phone"),
    email: optionalString("email"),
    invoicePrefix: requiredString("invoicePrefix"),
    lrPrefix: requiredString("lrPrefix"),
    invoiceRcmDeclaration: requiredString("invoiceRcmDeclaration"),
    invoiceFcmDeclaration: requiredString("invoiceFcmDeclaration"),
    lrRcmDeclaration: requiredString("lrRcmDeclaration"),
    lrFcmDeclaration: requiredString("lrFcmDeclaration"),
  };

  const parsed = companySchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const logoFile = formData.get("logoFile");
  const shouldClearLogo = requiredString("logoClear") === "1";
  let logoDataUpdate: string | null | undefined;

  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
      return {
        success: false,
        error: "Logo must be PNG, JPG, SVG, or WebP.",
      };
    }

    if (logoFile.size > MAX_LOGO_BYTES) {
      return {
        success: false,
        error: "Logo must be 2MB or smaller.",
      };
    }

    const arrayBuffer = await logoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = logoFile.type || "image/png";
    logoDataUpdate = `data:${mimeType};base64,${buffer.toString("base64")}`;
  } else if (shouldClearLogo) {
    logoDataUpdate = null;
  }

  const logoPatch =
    typeof logoDataUpdate !== "undefined"
      ? { logoData: logoDataUpdate }
      : undefined;

  const result = await prisma.companyProfile.upsert({
    where: { id: 1 },
    update: {
      ...parsed.data,
      ...logoPatch,
    },
    create: {
      id: 1,
      ...parsed.data,
      logoData: logoDataUpdate ?? null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true, logoData: result.logoData ?? null };
}

export async function updateTaxSetting(data: unknown) {
  await requireAdminSession();
  const parsed = taxSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.taxSetting.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  revalidatePath("/settings");

  return { success: true };
}

export async function updateUserCredentials(data: unknown) {
  await requireAdminSession();
  const parsed = credentialsSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    adminUsername,
    adminPassword,
    userUsername,
    userPassword,
  } = parsed.data;

  const [adminHash, userHash] = await Promise.all([
    hash(adminPassword, 10),
    hash(userPassword, 10),
  ]);

  await prisma.$transaction([
    prisma.userCredential.upsert({
      where: { role: "ADMIN" },
      update: { username: adminUsername, passwordHash: adminHash },
      create: {
        role: "ADMIN",
        username: adminUsername,
        passwordHash: adminHash,
      },
    }),
    prisma.userCredential.upsert({
      where: { role: "USER" },
      update: { username: userUsername, passwordHash: userHash },
      create: {
        role: "USER",
        username: userUsername,
        passwordHash: userHash,
      },
    }),
  ]);

  revalidatePath("/settings");

  return { success: true };
}

