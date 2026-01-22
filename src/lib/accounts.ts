import { prisma } from "./prisma";

export async function getAccountsByCodes(codes: string[]) {
  const accounts = await prisma.account.findMany({
    where: { code: { in: codes } },
  });

  const map = new Map(accounts.map((account) => [account.code, account]));

  return codes.map((code) => {
    const account = map.get(code);
    if (!account) {
      throw new Error(`Required account ${code} not found. Seed data missing.`);
    }
    return account;
  });
}

export async function getAllAccounts() {
  return prisma.account.findMany({
    orderBy: { name: "asc" },
  });
}

