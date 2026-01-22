import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning";
};

export function StatCard({
  title,
  value,
  helper,
  icon,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm",
        variant === "success" && "border-emerald-100",
        variant === "warning" && "border-amber-100"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {helper && <p className="text-sm text-slate-500">{helper}</p>}
    </div>
  );
}










