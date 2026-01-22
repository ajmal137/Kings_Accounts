"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  address: z.string().min(5),
  gstin: z.string().optional().nullable(),
  contactPhone: z.string().min(5),
  contactEmail: z.string().email().optional().nullable(),
  isRegistered: z.boolean().optional(),
});

const vehicleSchema = z.object({
  id: z.string().optional(),
  vehicleNumber: z.string().min(4),
  description: z.string().optional().nullable(),
  ownerName: z.string().min(2),
  isOwnedByFirm: z.boolean().optional(),
});

const accountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  code: z.string().min(3),
  type: z.string().min(3),
});

async function handleAction(action: () => Promise<unknown>) {
  await action();
  revalidatePath("/masters");
  revalidatePath("/consignments");
  revalidatePath("/invoices");
}

export async function createCustomer(data: unknown) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await handleAction(() =>
    prisma.customer.create({
      data: {
        name: parsed.data.name,
        address: parsed.data.address,
        gstin: parsed.data.gstin ?? null,
        contactPhone: parsed.data.contactPhone,
        contactEmail: parsed.data.contactEmail ?? null,
        isRegistered: parsed.data.isRegistered ?? false,
      },
    })
  );

  return { success: true };
}

export async function updateCustomer(data: unknown) {
  const parsed = customerSchema.extend({ id: z.string() }).safeParse(data);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await handleAction(() =>
    prisma.customer.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        address: parsed.data.address,
        gstin: parsed.data.gstin ?? null,
        contactPhone: parsed.data.contactPhone,
        contactEmail: parsed.data.contactEmail ?? null,
        isRegistered: parsed.data.isRegistered ?? false,
      },
    })
  );

  return { success: true };
}

export async function deleteCustomer(id: string) {
  await handleAction(() =>
    prisma.customer.delete({
      where: { id },
    })
  );
  return { success: true };
}

export async function createVehicle(data: unknown) {
  const parsed = vehicleSchema.safeParse(data);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await handleAction(() =>
    prisma.vehicle.create({
      data: {
        vehicleNumber: parsed.data.vehicleNumber,
        description: parsed.data.description ?? null,
        ownerName: parsed.data.ownerName,
        isOwnedByFirm: parsed.data.isOwnedByFirm ?? false,
      },
    })
  );

  return { success: true };
}

export async function updateVehicle(data: unknown) {
  const parsed = vehicleSchema.extend({ id: z.string() }).safeParse(data);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await handleAction(() =>
    prisma.vehicle.update({
      where: { id: parsed.data.id },
      data: {
        vehicleNumber: parsed.data.vehicleNumber,
        description: parsed.data.description ?? null,
        ownerName: parsed.data.ownerName,
        isOwnedByFirm: parsed.data.isOwnedByFirm ?? false,
      },
    })
  );

  return { success: true };
}

export async function deleteVehicle(id: string) {
  await handleAction(() =>
    prisma.vehicle.delete({
      where: { id },
    })
  );
  return { success: true };
}

export async function createAccount(data: unknown) {
  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await handleAction(() =>
    prisma.account.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        type: parsed.data.type,
      },
    })
  );

  return { success: true };
}

export async function updateAccount(data: unknown) {
  const parsed = accountSchema.extend({ id: z.string() }).safeParse(data);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await handleAction(() =>
    prisma.account.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        type: parsed.data.type,
      },
    })
  );

  return { success: true };
}

export async function deleteAccount(id: string) {
  await handleAction(() =>
    prisma.account.delete({
      where: { id },
    })
  );
  return { success: true };
}



