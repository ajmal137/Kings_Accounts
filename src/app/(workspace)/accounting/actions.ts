"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  ledgerEntrySchema,
  LedgerEntryFormValues,
} from "@/lib/validations";
import { getAccountsByCodes } from "@/lib/accounts";
import { z } from "zod";
import { compare } from "bcryptjs";

const DEBTORS_ACCOUNT_CODE = "AR-001";

export async function createLedgerEntry(data: LedgerEntryFormValues) {
  const parsed = ledgerEntrySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const values = parsed.data;

  const [debtorsAccount] = await getAccountsByCodes([DEBTORS_ACCOUNT_CODE]);
  const needsCustomer =
    values.debitAccountId === debtorsAccount.id ||
    values.creditAccountId === debtorsAccount.id;

  if (needsCustomer && !values.customerId) {
    return {
      success: false,
      errors: {
        customerId: ["Select customer for Sundry Debtors entry"],
      },
    };
  }

  if (values.customerId) {
    const customerExists = await prisma.customer.findUnique({
      where: { id: values.customerId },
      select: { id: true },
    });

    if (!customerExists) {
      return {
        success: false,
        errors: {
          customerId: ["Selected customer does not exist"],
        },
      };
    }
  }

  if (values.debitAccountId === values.creditAccountId) {
    return {
      success: false,
      errors: {
        debitAccountId: ["Debit and credit accounts must differ"],
        creditAccountId: ["Debit and credit accounts must differ"],
      },
    };
  }

  await prisma.ledgerEntry.create({
    data: {
      date: new Date(values.date),
      description: values.description,
      debitAccountId: values.debitAccountId,
      creditAccountId: values.creditAccountId,
      amount: values.amount,
      customerId: needsCustomer ? values.customerId ?? null : null,
    },
  });

  revalidatePath("/accounting");
  revalidatePath("/reports");

  return { success: true };
}

const deleteEntrySchema = z.object({
  entryId: z.string().min(1, "Entry id is required."),
  adminPassword: z.string().min(6, "Admin password is required."),
});

export async function deleteLedgerEntry(data: unknown) {
  const parsed = deleteEntrySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Invalid input.",
    };
  }

  const { entryId, adminPassword } = parsed.data;

  const admin = await prisma.userCredential.findUnique({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    return {
      success: false,
      message: "Admin credentials are not configured.",
    };
  }

  const isValid = await compare(adminPassword, admin.passwordHash);
  if (!isValid) {
    return {
      success: false,
      message: "Incorrect admin password.",
    };
  }

  const entry = await prisma.ledgerEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    return {
      success: false,
      message: "Ledger entry not found.",
    };
  }

  await prisma.ledgerEntry.delete({ where: { id: entryId } });

  revalidatePath("/accounting");
  revalidatePath("/reports");

  return { success: true };
}


