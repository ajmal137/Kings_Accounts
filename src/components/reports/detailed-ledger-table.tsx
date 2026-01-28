import { LedgerEntry, Account, Invoice, ConsignmentNote, Customer } from "@/generated/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

type LedgerEntryWithRelations = LedgerEntry & {
    debitAccount: Account;
    creditAccount: Account;
    linkedInvoice: Invoice | null;
    linkedConsignment: ConsignmentNote | null;
    customer: Customer | null;
};

type DetailedLedgerTableProps = {
    entries: LedgerEntryWithRelations[];
    openingBalance: number;
    closingBalance: number;
    accountId: string;
};

export function DetailedLedgerTable({
    entries,
    openingBalance,
    closingBalance,
    accountId,
}: DetailedLedgerTableProps) {
    // Helper to determine debit/credit display for balance
    const formatBalance = (amount: number) => {
        const absAmount = Math.abs(amount);
        const suffix = amount >= 0 ? "Dr" : "Cr";
        return `${formatCurrency(absAmount)} ${suffix}`;
    };

    return (
        <div className="overflow-hidden rounded-xl border bg-white">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-right">Debit</th>
                        <th className="px-4 py-3 text-right">Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {/* Opening Balance Row */}
                    <tr className="bg-slate-50 font-semibold text-slate-700">
                        <td className="px-4 py-3" colSpan={2}>
                            Opening Balance
                        </td>
                        <td className="px-4 py-3 text-right">
                            {openingBalance > 0 ? formatCurrency(openingBalance) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                            {openingBalance < 0 ? formatCurrency(Math.abs(openingBalance)) : "-"}
                        </td>
                    </tr>

                    {/* Entries */}
                    {entries.length === 0 ? (
                        <tr className="text-slate-500">
                            <td className="px-4 py-6 text-center" colSpan={4}>
                                No transactions in this period.
                            </td>
                        </tr>
                    ) : (
                        entries.map((entry) => {
                            const isDebit = entry.debitAccountId === accountId;
                            const amount = Number(entry.amount);

                            return (
                                <tr key={entry.id} className="text-slate-700 hover:bg-slate-50">
                                    <td className="px-4 py-3">{formatDate(entry.date)}</td>
                                    <td className="px-4 py-3">
                                        {entry.description}
                                        {entry.linkedInvoice && (
                                            <span className="block text-xs text-slate-500">
                                                Invoice #{entry.linkedInvoice.invoiceNumber}
                                            </span>
                                        )}
                                        {entry.linkedConsignment && (
                                            <span className="block text-xs text-slate-500">
                                                LR #{entry.linkedConsignment.lrNumber}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-emerald-600">
                                        {isDebit ? formatCurrency(amount) : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-red-600">
                                        {!isDebit ? formatCurrency(amount) : "-"}
                                    </td>
                                </tr>
                            );
                        })
                    )}

                    {/* Closing Balance Row */}
                    <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                        <td className="px-4 py-3" colSpan={2}>
                            Closing Balance
                        </td>
                        <td className="px-4 py-3 text-right">
                            {closingBalance > 0 ? formatCurrency(closingBalance) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                            {closingBalance < 0 ? formatCurrency(Math.abs(closingBalance)) : "-"}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
