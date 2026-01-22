import { prisma } from "./prisma";

export async function getCompanyProfile() {
  const profile = await prisma.companyProfile.findUnique({
    where: { id: 1 },
  });

  if (!profile) {
    throw new Error(
      "Company profile not found. Run the seed script to create baseline data."
    );
  }

  return profile;
}

export function toLogoSrc(logoData?: string | null): string | null {
  if (!logoData) return null;
  return logoData.startsWith("data:") ? logoData : `data:image/png;base64,${logoData}`;
}



