import { prisma } from "./prisma";
import type { Customer } from "@/generated/prisma";

const DEBTORS_ACCOUNT_CODE = "AR-001";

export async function listLedgerEntries(params?: {
  accountId?: string;
  limit?: number;
  from?: Date;
  to?: Date;
  customerId?: string;
}) {
  const { accountId, limit = 50, from, to, customerId } = params ?? {};

  const dateFilter =
    from || to
      ? {
        date: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      }
      : undefined;

  return prisma.ledgerEntry.findMany({
    where: {
      ...(accountId
        ? {
          OR: [
            { debitAccountId: accountId },
            { creditAccountId: accountId },
          ],
        }
        : {}),
      ...dateFilter,
      ...(customerId
        ? {
          OR: [
            { customerId },
            { linkedInvoice: { customerId } },
          ],
        }
        : {}),
    },
    include: {
      debitAccount: true,
      creditAccount: true,
      linkedInvoice: true,
      linkedConsignment: true,
      customer: true,
    },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getTrialBalance() {
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
    include: {
      ledgerDebit: {
        select: { amount: true },
      },
      ledgerCredit: {
        select: { amount: true },
      },
    },
  });

  return accounts.map((account) => {
    const debitSum = account.ledgerDebit.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );
    const creditSum = account.ledgerCredit.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );

    const balance = debitSum - creditSum;
    const debitTotal = balance > 0 ? balance : 0;
    const creditTotal = balance < 0 ? -balance : 0;

    return {
      account,
      debitTotal,
      creditTotal,
      balance,
    };
  });
}

export async function getCashBankSummary() {
  const cashAccounts = await prisma.account.findMany({
    where: { type: { in: ["CASH", "BANK"] } },
    include: {
      ledgerDebit: { select: { amount: true } },
      ledgerCredit: { select: { amount: true } },
    },
  });

  return cashAccounts.map((account) => {
    const debitTotal = account.ledgerDebit.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );
    const creditTotal = account.ledgerCredit.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: debitTotal - creditTotal,
    };
  });
}

export async function getIncomeExpenseSummary() {
  const accounts = await prisma.account.findMany({
    where: { type: { in: ["INCOME", "EXPENSE"] } },
    include: {
      ledgerDebit: { select: { amount: true } },
      ledgerCredit: { select: { amount: true } },
    },
  });

  let income = 0;
  let expense = 0;

  accounts.forEach((account) => {
    const debitTotal = account.ledgerDebit.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );
    const creditTotal = account.ledgerCredit.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );
    const balance = debitTotal - creditTotal;

    if (account.type === "INCOME") {
      income += -balance; // Income typically credit balance
    } else {
      expense += balance;
    }
  });

  return {
    income,
    expense,
    net: income - expense,
  };
}

export async function getDebtorSubLedgerBalances() {
  const debtorsAccount = await prisma.account.findUnique({
    where: { code: DEBTORS_ACCOUNT_CODE },
    select: { id: true },
  });

  if (!debtorsAccount) {
    throw new Error("Sundry Debtors account not found (AR-001). Seed data missing.");
  }

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      OR: [
        { debitAccountId: debtorsAccount.id },
        { creditAccountId: debtorsAccount.id },
      ],
    },
    select: {
      amount: true,
      debitAccountId: true,
      creditAccountId: true,
      customerId: true,
      customer: true,
      linkedInvoice: {
        select: {
          customerId: true,
          customer: true,
        },
      },
    },
  });

  const balances = new Map<
    string,
    {
      customer: Customer;
      balance: number;
    }
  >();

  entries.forEach((entry) => {
    const resolvedCustomer =
      entry.customer ?? entry.linkedInvoice?.customer ?? null;
    const resolvedCustomerId =
      entry.customerId ?? entry.linkedInvoice?.customerId ?? null;

    if (!resolvedCustomer || !resolvedCustomerId) return;
    const sign = entry.debitAccountId === debtorsAccount.id ? 1 : -1;
    const current = balances.get(resolvedCustomerId) ?? {
      customer: resolvedCustomer,
      balance: 0,
    };
    current.balance += Number(entry.amount) * sign;
    balances.set(resolvedCustomerId, current);
  });

  return Array.from(balances.values()).sort((a, b) =>
    a.customer.name.localeCompare(b.customer.name)
  );
}

export async function getAccountLedgerDetails(
  accountId: string,
  from: Date,
  to: Date,
  customerId?: string
) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error("Account not found");

  const customerFilter = customerId
    ? {
      OR: [
        { customerId },
        { linkedInvoice: { customerId } },
        { linkedConsignment: { customerId } },
      ],
    }
    : {};

  // Calculate Opening Balance (sum of all entries before 'from')
  const previousEntries = await prisma.ledgerEntry.findMany({
    where: {
      OR: [{ debitAccountId: accountId }, { creditAccountId: accountId }],
      date: { lt: from },
      ...customerFilter,
    },
    select: {
      amount: true,
      debitAccountId: true,
    },
  });

  let openingBalance = 0;
  for (const entry of previousEntries) {
    if (entry.debitAccountId === accountId) {
      openingBalance += Number(entry.amount);
    } else {
      openingBalance -= Number(entry.amount);
    }
  }

  // Fetch Range Entries
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      OR: [{ debitAccountId: accountId }, { creditAccountId: accountId }],
      date: { gte: from, lte: to },
      ...customerFilter,
    },
    include: {
      debitAccount: true,
      creditAccount: true,
      linkedInvoice: true,
      linkedConsignment: true,
      customer: true,
    },
    orderBy: { date: "asc" },
  });

  // Calculate Closing Balance
  let closingBalance = openingBalance;
  for (const entry of entries) {
    if (entry.debitAccountId === accountId) {
      closingBalance += Number(entry.amount);
    } else {
      closingBalance -= Number(entry.amount);
    }
  }

  return {
    account,
    openingBalance,
    closingBalance,
    entries,
  };
}



