import { prisma } from "./prisma";

export async function getTaxSetting() {
  const tax = await prisma.taxSetting.findUnique({
    where: { id: 1 },
  });

  if (!tax) {
    throw new Error("Tax settings not found. Please seed the database.");
  }

  return tax;
}










