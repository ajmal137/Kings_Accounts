import { prisma } from "./prisma";

export async function listInvoices(params?: { type?: string }) {
  const { type } = params ?? {};

  return prisma.invoice.findMany({
    where: type ? { invoiceType: type } : undefined,
    include: { customer: true, consignmentNote: true },
    orderBy: { date: "desc" },
    take: 50,
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      consignmentNote: { include: { vehicle: true } },
    },
  });
}










