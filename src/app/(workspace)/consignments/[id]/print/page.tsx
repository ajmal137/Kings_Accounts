import { notFound } from "next/navigation";
import { getConsignmentById } from "@/lib/consignments";
import { LorryReceiptPrint } from "@/components/consignments/lorry-receipt-print";

export const dynamic = "force-dynamic";

type ConsignmentPrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConsignmentPrintPage({
  params,
}: ConsignmentPrintPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const consignment = await getConsignmentById(id);

  if (!consignment) {
    notFound();
  }

  return <LorryReceiptPrint consignment={consignment} />;
}






