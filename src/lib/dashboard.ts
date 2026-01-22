import { prisma } from "./prisma";
import { getDebtorSubLedgerBalances } from "./ledger";

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEndOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export async function getDashboardMetrics() {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const monthStart = getStartOfMonth(now);
  const monthEnd = getEndOfMonth(now);

  const [
    todayConsignments,
    monthFreight,
    totalInvoiced,
    debtorSubLedgers,
    recentConsignments,
    recentInvoices,
  ] =
    await Promise.all([
      prisma.consignmentNote.count({
        where: { date: { gte: todayStart } },
      }),
      prisma.consignmentNote.aggregate({
        _sum: { freightAmount: true },
        where: { date: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.invoice.aggregate({
        _sum: { totalAmount: true },
      }),
      getDebtorSubLedgerBalances(),
      prisma.consignmentNote.findMany({
        orderBy: { date: "desc" },
        include: {
          customer: true,
          vehicle: true,
        },
        take: 5,
      }),
      prisma.invoice.findMany({
        orderBy: { date: "desc" },
        include: {
          customer: true,
          consignmentNote: true,
        },
        take: 5,
      }),
    ]);

  // Outstanding is the current Sundry Debtors balance (invoices minus receipts)
  const outstandingInvoices = debtorSubLedgers.reduce(
    (sum, row) => sum + row.balance,
    0
  );

  return {
    todayConsignments,
    monthFreight: Number(monthFreight._sum.freightAmount ?? 0),
    outstandingInvoices: Number(outstandingInvoices),
    // keep total invoiced available for future use if needed
    totalInvoiced: Number(totalInvoiced._sum.totalAmount ?? 0),
    recentConsignments,
    recentInvoices,
  };
}



