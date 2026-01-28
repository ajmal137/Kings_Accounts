import { Metadata } from "next";
import {
  getTrialBalance,
  getCashBankSummary,
  getIncomeExpenseSummary,
  getDebtorSubLedgerBalances,
  getAccountLedgerDetails,
} from "@/lib/ledger";
import { getCustomers } from "@/lib/masters";
import { getAllAccounts } from "@/lib/accounts";
import { TrialBalanceTable } from "@/components/reports/trial-balance-table";
import { SummaryCards } from "@/components/reports/summary-cards";
import { DebtorSubLedgerTable } from "@/components/reports/debtor-subledger-table";
import { DetailedLedgerTable } from "@/components/reports/detailed-ledger-table";
import { AccountSelect } from "@/components/reports/account-select";
import { CustomerSelect } from "@/components/reports/customer-select";
import { DateRangeFilter } from "@/components/accounting/date-range-filter";

export const metadata: Metadata = {
  title: "Reports | Kings Transport",
};

export default async function ReportsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const ledgerAccountId = searchParams.ledgerAccountId as string;
  const customerId = searchParams.customerId as string;
  const today = new Date().toISOString().split("T")[0];
  const fromStr = (searchParams.from as string) ?? today;
  const toStr = (searchParams.to as string) ?? today;
  const from = new Date(fromStr);
  const to = new Date(toStr);

  const [
    trialBalance,
    cashBank,
    incomeExpense,
    debtorSubLedgers,
    accounts,
    customers,
    ledgerDetails,
  ] = await Promise.all([
    getTrialBalance(),
    getCashBankSummary(),
    getIncomeExpenseSummary(),
    getDebtorSubLedgerBalances(),
    getAllAccounts(),
    getCustomers(),
    ledgerAccountId
      ? getAccountLedgerDetails(ledgerAccountId, from, to, customerId)
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">
          Monitor cash/bank balances, income vs expense, and trial balance.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Detailed Ledger View
          </h3>
          <p className="text-sm text-slate-500">
            View transaction history for a specific account.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <AccountSelect accounts={accounts} />
          <CustomerSelect customers={customers} />
          <DateRangeFilter />
        </div>
        {ledgerDetails && (
          <DetailedLedgerTable
            entries={ledgerDetails.entries}
            openingBalance={ledgerDetails.openingBalance}
            closingBalance={ledgerDetails.closingBalance}
            accountId={ledgerDetails.account.id}
          />
        )}
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

