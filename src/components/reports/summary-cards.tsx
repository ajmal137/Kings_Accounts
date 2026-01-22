import { formatCurrency } from "@/lib/format";

type CashBankSummary = {
  id: string;
  name: string;
  type: string;
  balance: number;
};

type SummaryCardsProps = {
  cashBank: CashBankSummary[];
  incomeExpense: { income: number; expense: number; net: number };
};

export function SummaryCards({
  cashBank,
  incomeExpense,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Cash & Bank
        </h3>
        <ul className="mt-3 space-y-2 text-sm">
          {cashBank.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
            >
              <span>{item.name}</span>
              <span
                className={
                  item.balance >= 0 ? "text-emerald-600" : "text-rose-600"
                }
              >
                {formatCurrency(item.balance)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Income vs Expense
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt>Income</dt>
            <dd className="font-medium text-emerald-600">
              {formatCurrency(incomeExpense.income)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Expense</dt>
            <dd className="font-medium text-rose-600">
              {formatCurrency(incomeExpense.expense)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
            <dt>Net</dt>
            <dd
              className={
                incomeExpense.net >= 0 ? "text-emerald-700" : "text-rose-700"
              }
            >
              {formatCurrency(incomeExpense.net)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}










