"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { consignmentSchema } from "@/lib/validations";
import { nextSequenceNumber } from "@/lib/sequences";
import { z } from "zod";
import { compare } from "bcryptjs";

export async function createConsignment(rawData: unknown) {
  const parsed = consignmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const lrNumber = await nextSequenceNumber("LR");

    const consignment = await prisma.consignmentNote.create({
      data: {
        lrNumber,
        date: new Date(data.date),
        consignorName: data.consignorName,
        consignorAddress: data.consignorAddress,
        consignorGstin: data.consignorGstin ?? null,
        consigneeName: data.consigneeName,
        consigneeAddress: data.consigneeAddress,
        consigneeGstin: data.consigneeGstin ?? null,
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        goodsDescription: data.goodsDescription,
        numPackages: data.numPackages,
        weight: data.weight,
        freightAmount: data.freightAmount,
        paymentType: data.paymentType,
        gstMode: data.gstMode,
        ownerRiskOrCarrierRisk: data.ownerRiskOrCarrierRisk,
        ewayBillNumber: data.ewayBillNumber ?? null,
        remarks: data.remarks ?? null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/consignments");
    redirect(`/consignments/${consignment.id}`);
  } catch (error: any) {
    console.error("Failed to create consignment:", error);
    if (error?.code) {
      console.error("Prisma Error Code:", error.code);
      console.error("Prisma Error Meta:", error.meta);
    }
    return {
      success: false,
      message: `Failed to create consignment: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

const deleteConsignmentSchema = z.object({
  consignmentId: z.string().min(1, "Consignment id is required."),
  adminPassword: z.string().min(6, "Admin password is required."),
});

export async function deleteConsignment(data: unknown) {
  const parsed = deleteConsignmentSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Invalid input.",
    };
  }

  const { consignmentId, adminPassword } = parsed.data;

  const admin = await prisma.userCredential.findUnique({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    return {
      success: false,
      message: "Admin credentials are not configured.",
    };
  }

  const isValidPassword = await compare(adminPassword, admin.passwordHash);

  if (!isValidPassword) {
    return {
      success: false,
      message: "Incorrect admin password.",
    };
  }

  const consignment = await prisma.consignmentNote.findUnique({
    where: { id: consignmentId },
  });

  if (!consignment) {
    return {
      success: false,
      message: "Consignment not found.",
    };
  }

  const [invoiceCount, ledgerCount] = await Promise.all([
    prisma.invoice.count({ where: { consignmentNoteId: consignmentId } }),
    prisma.ledgerEntry.count({ where: { linkedConsignmentId: consignmentId } }),
  ]);

  if (invoiceCount > 0) {
    return {
      success: false,
      message:
        "This consignment has linked invoices. Delete those invoices first.",
    };
  }

  if (ledgerCount > 0) {
    return {
      success: false,
      message:
        "This consignment has ledger postings. Remove those entries first.",
    };
  }

  await prisma.consignmentNote.delete({
    where: { id: consignmentId },
  });

  revalidatePath("/consignments");
  revalidatePath("/dashboard");

  return { success: true };
}


