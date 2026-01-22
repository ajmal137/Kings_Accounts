import { prisma } from "./prisma";

export type SequenceKind = "LR" | "INVOICE";

export async function nextSequenceNumber(
  sequenceType: SequenceKind,
  options?: { padTo?: number }
) {
  const padTo = options?.padTo ?? 4;

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.sequenceCounter.findUnique({
      where: { sequenceType },
    });

    if (!existing) {
      throw new Error(
        `Missing sequence counter for ${sequenceType}. Please seed the database.`
      );
    }

    const nextNumber = existing.currentNumber + 1;

    await tx.sequenceCounter.update({
      where: { sequenceType },
      data: { currentNumber: nextNumber },
    });

    const padded = String(nextNumber).padStart(padTo, "0");
    return `${existing.prefix}-${padded}`;
  }, {
    timeout: 30000, // Increase timeout to 30s for Neon cold starts
  });

  return result;
}










