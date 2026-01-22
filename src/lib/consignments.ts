import { prisma } from "./prisma";
import type { ConsignmentNote, Customer, Vehicle } from "@/generated/prisma";

export async function listConsignments(params?: {
  query?: string;
  customerId?: string;
  vehicleId?: string;
}): Promise<
  Array<
    ConsignmentNote & { customer: Customer | null; vehicle: Vehicle | null }
  >
> {
  const { query, customerId, vehicleId } = params ?? {};

  return prisma.consignmentNote.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { lrNumber: { contains: query } },
              { consignorName: { contains: query } },
              { consigneeName: { contains: query } },
              { fromLocation: { contains: query } },
              { toLocation: { contains: query } },
            ],
          }
        : {}),
      ...(customerId ? { customerId } : {}),
      ...(vehicleId ? { vehicleId } : {}),
    },
    include: {
      customer: true,
      vehicle: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 50,
  }) as Promise<
    Array<
      ConsignmentNote & { customer: Customer | null; vehicle: Vehicle | null }
    >
  >;
}

export async function getConsignmentById(id: string) {
  return prisma.consignmentNote.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
    },
  });
}



