import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Cannot seed database.");
}

const prisma = new PrismaClient();

async function main() {
  await prisma.companyProfile.upsert({
    where: { id: 1 },
    update: {
      firmName: "KINGS TRANSPORTS",
      address: "Plot 12, Transport Nagar, Pune, Maharashtra",
      gstin: "27ABCDE1234F1Z5",
      phone: "+91-9876543210",
      email: "operations@kingstransport.in",
      invoicePrefix: "KT/25-26/INV",
      lrPrefix: "KT/LR/25-26",
    },
    create: {
      id: 1,
      firmName: "KINGS TRANSPORTS",
      address: "Plot 12, Transport Nagar, Pune, Maharashtra",
      gstin: "27ABCDE1234F1Z5",
      phone: "+91-9876543210",
      email: "operations@kingstransport.in",
      invoicePrefix: "KT/25-26/INV",
      lrPrefix: "KT/LR/25-26",
    },
  });

  await prisma.taxSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      fc5CgstRate: 2.5,
      fc5SgstRate: 2.5,
      fc18CgstRate: 9,
      fc18SgstRate: 9,
    },
  });

  const sequences = [
    { sequenceType: "LR", prefix: "KT/LR/25-26" },
    { sequenceType: "INVOICE", prefix: "KT/25-26/INV" },
  ];

  for (const sequence of sequences) {
    await prisma.sequenceCounter.upsert({
      where: { sequenceType: sequence.sequenceType },
      update: { prefix: sequence.prefix },
      create: {
        sequenceType: sequence.sequenceType,
        prefix: sequence.prefix,
        currentNumber: 0,
      },
    });
  }

  const accounts: Array<{
    code: string;
    name: string;
    type: string;
  }> = [
      { code: "BANK-001", name: "Bank - HDFC", type: "BANK" },
      { code: "CASH-001", name: "Cash on Hand", type: "CASH" },
      {
        code: "INC-FRT-RCM",
        name: "Freight Income (RCM)",
        type: "INCOME",
      },
      {
        code: "INC-FRT-FCM",
        name: "Freight Income (FCM)",
        type: "INCOME",
      },
      {
        code: "INC-FRT-FCM-GST-CGST",
        name: "GST Output CGST",
        type: "LIABILITY",
      },
      {
        code: "INC-FRT-FCM-GST-SGST",
        name: "GST Output SGST",
        type: "LIABILITY",
      },
      {
        code: "EXP-REP",
        name: "Repairs & Maintenance",
        type: "EXPENSE",
      },
      {
        code: "EXP-DIESEL",
        name: "Diesel / Fuel",
        type: "EXPENSE",
      },
      {
        code: "EXP-HIRE",
        name: "Vehicle Hire Charges",
        type: "EXPENSE",
      },
      {
        code: "AR-001",
        name: "Sundry Debtors",
        type: "ASSET",
      },
      {
        code: "AP-001",
        name: "Sundry Creditors",
        type: "LIABILITY",
      },
    ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: { name: account.name, type: account.type },
      create: account,
    });
  }

  // Seed Admin Credential
  const adminPassword = await import("bcryptjs").then((bcrypt) =>
    bcrypt.hash("admin123", 10)
  );

  await prisma.userCredential.upsert({
    where: { role: "ADMIN" },
    update: {
      passwordHash: adminPassword,
    },
    create: {
      role: "ADMIN",
      username: "admin",
      passwordHash: adminPassword,
    },
  });

  console.log("Admin user seeded (username: admin, password: admin123)");
}

main()
  .then(async () => {
    console.log("Database seeded successfully ✅");
  })
  .catch(async (error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

