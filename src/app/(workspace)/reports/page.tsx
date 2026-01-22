import { Metadata } from "next";
import {
  getTrialBalance,
  getCashBankSummary,
  getIncomeExpenseSummary,
  getDebtorSubLedgerBalances,
} from "@/lib/ledger";
import { TrialBalanceTable } from "@/components/reports/trial-balance-table";
import { SummaryCards } from "@/components/reports/summary-cards";
import { DebtorSubLedgerTable } from "@/components/reports/debtor-subledger-table";

export const metadata: Metadata = {
  title: "Reports | Kings Transport",
};

export default async function ReportsPage() {
  const [trialBalance, cashBank, incomeExpense, debtorSubLedgers] =
    await Promise.all([
    getTrialBalance(),
    getCashBankSummary(),
    getIncomeExpenseSummary(),
      getDebtorSubLedgerBalances(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">
          Monitor cash/bank balances, income vs expense, and trial balance.
        </p>
      </div>

      <SummaryCards cashBank={cashBank} incomeExpense={incomeExpense} />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Trial Balance
          </h3>
          <p className="text-sm text-slate-500">
            Quick check that debits equal credits.
          </p>
        </div>
        <TrialBalanceTable rows={trialBalance} />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Sundry Debtors (Customer Sub-ledgers)
          </h3>
          <p className="text-sm text-slate-500">
            Customer-wise balances derived from entries posted to Sundry
            Debtors.
          </p>
        </div>
        <DebtorSubLedgerTable rows={debtorSubLedgers} />
      </div>
    </div>
  );
}

