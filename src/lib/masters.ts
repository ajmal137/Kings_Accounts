import { prisma } from "./prisma";

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getVehicles() {
  return prisma.vehicle.findMany({
    orderBy: { vehicleNumber: "asc" },
  });
}










