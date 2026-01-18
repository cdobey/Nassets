import React from 'react';
import { format } from 'date-fns';
import { Calendar, Repeat, TrendingDown, TrendingUp } from 'lucide-react';
import type { CalendarResponse } from '@/types';
import { RecurrenceType } from '@/types';

interface UpcomingTransactionsProps {
  calendar?: CalendarResponse;
}

interface TransactionItemProps {
  title: string;
  amount: number;
  date: string;
  recurrence_type: RecurrenceType;
  category?: string | null;
  type: 'income' | 'expense';
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  title,
  amount,
  date,
  recurrence_type,
  category,
  type,
}) => {
  const isIncome = type === 'income';
  const gradient = isIncome ? 'from-success-50 to-green-50' : 'from-danger-50 to-red-50';
  const textColor = isIncome ? 'text-success-700' : 'text-danger-700';
  const borderColor = isIncome ? 'border-success-200' : 'border-danger-200';
  const bgColor = isIncome ? 'bg-success-100' : 'bg-danger-100';
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <div
      className={`p-4 bg-gradient-to-r ${gradient} rounded-xl border-2 ${borderColor} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <Icon size={20} className={textColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-semibold text-gray-800 truncate">{title}</div>
            <div className={`text-lg font-bold ${textColor} whitespace-nowrap`}>
              €{amount.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{format(new Date(date), 'MMM d, yyyy')}</span>
            </div>
            {recurrence_type !== RecurrenceType.NONE && (
              <div className="flex items-center gap-1">
                <Repeat size={12} />
                <span className="font-medium">{recurrence_type}</span>
              </div>
            )}
            {category && <span className="px-2 py-0.5 bg-white rounded-full">{category}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UpcomingTransactions: React.FC<UpcomingTransactionsProps> = ({ calendar }) => {
  if (!calendar) {
    return <div className="p-6 text-center text-gray-400">Loading transactions...</div>;
  }

  const sortedIncomes = [...calendar.incomes].sort(
    (a, b) => new Date(a.occurrence_date).getTime() - new Date(b.occurrence_date).getTime()
  );
  const sortedExpenses = [...calendar.expenses].sort(
    (a, b) => new Date(a.occurrence_date).getTime() - new Date(b.occurrence_date).getTime()
  );

  const totalIncome = sortedIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="p-6 h-full overflow-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Transactions</h2>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-success-500 to-success-600 rounded-lg">
            <TrendingUp size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">Income</h3>
          <span className="ml-auto text-sm font-semibold text-success-600">
            {sortedIncomes.length} item{sortedIncomes.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {sortedIncomes.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              No upcoming income scheduled
            </div>
          ) : (
            sortedIncomes.map((income, idx) => (
              <TransactionItem
                key={`income-${idx}`}
                title={income.title}
                amount={income.amount}
                date={income.occurrence_date}
                recurrence_type={income.recurrence_type}
                type="income"
              />
            ))
          )}
        </div>

        {sortedIncomes.length > 0 && (
          <div className="mt-4 p-3 bg-success-50 rounded-lg border border-success-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Expected Income:</span>
              <span className="text-xl font-bold text-success-600">€{totalIncome.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-danger-500 to-danger-600 rounded-lg">
            <TrendingDown size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">Expenses</h3>
          <span className="ml-auto text-sm font-semibold text-danger-600">
            {sortedExpenses.length} item{sortedExpenses.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {sortedExpenses.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              No upcoming expenses scheduled
            </div>
          ) : (
            sortedExpenses.map((expense, idx) => (
              <TransactionItem
                key={`expense-${idx}`}
                title={expense.title}
                amount={expense.amount}
                date={expense.occurrence_date}
                recurrence_type={expense.recurrence_type}
                category={expense.category}
                type="expense"
              />
            ))
          )}
        </div>

        {sortedExpenses.length > 0 && (
          <div className="mt-4 p-3 bg-danger-50 rounded-lg border border-danger-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Expected Expenses:</span>
              <span className="text-xl font-bold text-danger-600">€{totalExpense.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {(sortedIncomes.length > 0 || sortedExpenses.length > 0) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Net Balance:</span>
            <span
              className={`text-2xl font-bold ${
                netBalance >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              €{netBalance.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
