"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { nextSequenceNumber } from "@/lib/sequences";
import { getAccountsByCodes } from "@/lib/accounts";
import { z } from "zod";
import { compare } from "bcryptjs";

const ACCOUNT_CODES = {
  debtors: "AR-001",
  freightRCM: "INC-FRT-RCM",
  freightFCM: "INC-FRT-FCM",
  gstCgst: "INC-FRT-FCM-GST-CGST",
  gstSgst: "INC-FRT-FCM-GST-SGST",
};

export async function createInvoice(rawData: unknown) {
  const parsed = invoiceSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const invoiceNumber = await nextSequenceNumber("INVOICE");
  const invoiceDate = new Date(data.date);
  const gstPayableBy =
    data.invoiceType === "GTA_RCM" ? "RECIPIENT_RCM" : "SUPPLIER_FCM";

  const cgstAmount = (data.basicAmount * data.cgstRate) / 100;
  const sgstAmount = (data.basicAmount * data.sgstRate) / 100;
  const totalAmount = data.basicAmount + cgstAmount + sgstAmount;

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        date: invoiceDate,
        invoiceType: data.invoiceType,
        customerId: data.customerId,
        consignmentNoteId: data.consignmentNoteId || null,
        description: data.description,
        placeOfSupply: data.placeOfSupply,
        basicAmount: data.basicAmount,
        cgstRate: data.cgstRate,
        sgstRate: data.sgstRate,
        cgstAmount,
        sgstAmount,
        totalAmount,
        gstPayableBy,
        notes: data.notes ?? null,
      },
    });

    const [debtors, freightRCM, freightFCM, gstCgst, gstSgst] =
      await getAccountsByCodes([
        ACCOUNT_CODES.debtors,
        ACCOUNT_CODES.freightRCM,
        ACCOUNT_CODES.freightFCM,
        ACCOUNT_CODES.gstCgst,
        ACCOUNT_CODES.gstSgst,
      ]);

    const baseLedgerPayload = {
      date: invoiceDate,
      description: `Invoice ${invoice.invoiceNumber}`,
      linkedInvoiceId: invoice.id,
      linkedConsignmentId: invoice.consignmentNoteId,
    };

    if (data.invoiceType === "GTA_RCM") {
      await tx.ledgerEntry.create({
        data: {
          ...baseLedgerPayload,
          amount: data.basicAmount,
          debitAccountId: debtors.id,
          creditAccountId: freightRCM.id,
          customerId: data.customerId,
        },
      });
    } else {
      // FCM entries split across freight + GST
      await tx.ledgerEntry.create({
        data: {
          ...baseLedgerPayload,
          amount: data.basicAmount,
          debitAccountId: debtors.id,
          creditAccountId: freightFCM.id,
          customerId: data.customerId,
        },
      });
      if (cgstAmount > 0) {
        await tx.ledgerEntry.create({
          data: {
            ...baseLedgerPayload,
            amount: cgstAmount,
            debitAccountId: debtors.id,
            creditAccountId: gstCgst.id,
            customerId: data.customerId,
          },
        });
      }
      if (sgstAmount > 0) {
        await tx.ledgerEntry.create({
          data: {
            ...baseLedgerPayload,
            amount: sgstAmount,
            debitAccountId: debtors.id,
            creditAccountId: gstSgst.id,
            customerId: data.customerId,
          },
        });
      }
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  redirect("/invoices");
}

const deleteInvoiceSchema = z.object({
  invoiceId: z.string().min(1, "Invoice id is required."),
  adminPassword: z.string().min(6, "Admin password is required."),
});

export async function deleteInvoice(data: unknown) {
  const parsed = deleteInvoiceSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Invalid input.",
    };
  }

  const { invoiceId, adminPassword } = parsed.data;

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

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true },
  });

  if (!invoice) {
    return {
      success: false,
      message: "Invoice not found.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.ledgerEntry.deleteMany({
      where: { linkedInvoiceId: invoiceId },
    });

    await tx.invoice.delete({
      where: { id: invoiceId },
    });
  });

  revalidatePath("/invoices");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");

  return { success: true };
}


