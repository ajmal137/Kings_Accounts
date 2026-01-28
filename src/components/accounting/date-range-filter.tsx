"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function DateRangeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize with URL params or default to today
    const today = new Date().toISOString().split("T")[0];
    const [from, setFrom] = useState(searchParams.get("from") ?? today);
    const [to, setTo] = useState(searchParams.get("to") ?? today);

    const applyFilter = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (from) params.set("from", from);
        else params.delete("from");

        if (to) params.set("to", to);
        else params.delete("to");

        router.push(`?${params.toString()}`);
    }, [from, to, router, searchParams]);

    return (
        <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
                <label htmlFor="from" className="text-sm font-medium text-slate-700">
                    From
                </label>
                <input
                    id="from"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="to" className="text-sm font-medium text-slate-700">
                    To
                </label>
                <input
                    id="to"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
            </div>
            <button
                onClick={applyFilter}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
                Apply
            </button>
            <button
                onClick={() => {
                    setFrom(today);
                    setTo(today);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("from", today);
                    params.set("to", today);
                    router.push(`?${params.toString()}`);
                }}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                Reset (Today)
            </button>
        </div>
    );
}
