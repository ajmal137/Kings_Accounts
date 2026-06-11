import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting sequence counters in database...");

  // Reset LR sequence
  const lr = await prisma.sequenceCounter.update({
    where: { sequenceType: "LR" },
    data: { currentNumber: 0 },
  });
  console.log(`Reset LR sequence. Prefix: ${lr.prefix}, Current Number: ${lr.currentNumber}`);

  // Reset INVOICE sequence
  const invoice = await prisma.sequenceCounter.update({
    where: { sequenceType: "INVOICE" },
    data: { currentNumber: 0 },
  });
  console.log(`Reset INVOICE sequence. Prefix: ${invoice.prefix}, Current Number: ${invoice.currentNumber}`);

  console.log("Sequence counters reset successfully! 🎉");
}

main()
  .catch((e) => {
    console.error("Error resetting sequences:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
