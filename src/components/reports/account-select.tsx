"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Account } from "@/generated/prisma";

type AccountSelectProps = {
    accounts: Account[];
};

export function AccountSelect({ accounts }: AccountSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedAccount = searchParams.get("ledgerAccountId") || "";

    const handleSelect = (accountId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (accountId) {
            params.set("ledgerAccountId", accountId);
        } else {
            params.delete("ledgerAccountId");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <select
            value={selectedAccount}
            onChange={(e) => handleSelect(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
            <option value="">Select Account</option>
            {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                    {account.name}
                </option>
            ))}
        </select>
    );
}
