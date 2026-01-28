"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Customer } from "@/generated/prisma";

type CustomerSelectProps = {
    customers: Customer[];
};

export function CustomerSelect({ customers }: CustomerSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCustomer = searchParams.get("customerId") || "";

    const handleSelect = (customerId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (customerId) {
            params.set("customerId", customerId);
        } else {
            params.delete("customerId");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <select
            value={selectedCustomer}
            onChange={(e) => handleSelect(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm max-w-[200px]"
        >
            <option value="">All Customers</option>
            {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                    {customer.name}
                </option>
            ))}
        </select>
    );
}
