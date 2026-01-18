import type { CalendarResponse } from '@/types';
import { RecurrenceType } from '@/types';
import { format } from 'date-fns';
import { Calendar, Plus, TrendingDown, TrendingUp, X } from 'lucide-react';
import React from 'react';

interface DayDetailProps {
  day: Date;
  calendar?: CalendarResponse;
  onClose: () => void;
  onAddTransaction: () => void;
}

export const DayDetail: React.FC<DayDetailProps> = ({
  day,
  calendar,
  onClose,
  onAddTransaction,
}) => {
  if (!calendar) {
    return <div className="p-6 text-center text-gray-400">Loading...</div>;
  }

  const dayStr = format(day, 'yyyy-MM-dd');
  const incomes = calendar.incomes.filter((i) => i.occurrence_date === dayStr);
  const expenses = calendar.expenses.filter((e) => e.occurrence_date === dayStr);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netAmount = totalIncome - totalExpense;

  const hasTransactions = incomes.length > 0 || expenses.length > 0;

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{format(day, 'EEEE')}</h2>
          <p className="text-sm text-gray-600">{format(day, 'MMMM d, yyyy')}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-600 mb-1">Income</div>
            <div className="text-lg font-bold text-success-600">€{totalIncome.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Expenses</div>
            <div className="text-lg font-bold text-danger-600">€{totalExpense.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Net</div>
            <div
              className={`text-lg font-bold ${
                netAmount >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {netAmount >= 0 ? '+' : ''}€{netAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {!hasTransactions && (
        <div className="text-center py-12 text-gray-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-50" />
          <p>No transactions for this day</p>
          <p className="text-sm mt-2">Click the + button to add a transaction</p>
        </div>
      )}

      {incomes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-success-500 to-success-600 rounded-lg">
              <TrendingUp size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">Income</h3>
          </div>

          <div className="space-y-2">
            {incomes.map((income, idx) => (
              <div
                key={`income-${idx}`}
                className="p-4 bg-gradient-to-r from-success-50 to-green-50 rounded-xl border-2 border-success-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-gray-800">{income.title}</div>
                  <div className="text-xl font-bold text-success-600">
                    €{income.amount.toFixed(2)}
                  </div>
                </div>
                {income.description && (
                  <div className="text-sm text-gray-600 mb-2">{income.description}</div>
                )}
                {income.recurrence_type !== RecurrenceType.NONE && (
                  <div className="flex items-center gap-1 text-xs text-success-700 font-medium">
                    <Calendar size={12} />
                    <span>Recurring: {income.recurrence_type}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-danger-500 to-danger-600 rounded-lg">
              <TrendingDown size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">Expenses</h3>
          </div>

          <div className="space-y-2">
            {expenses.map((expense, idx) => (
              <div
                key={`expense-${idx}`}
                className="p-4 bg-gradient-to-r from-danger-50 to-red-50 rounded-xl border-2 border-danger-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-gray-800">{expense.title}</div>
                  <div className="text-xl font-bold text-danger-600">
                    €{expense.amount.toFixed(2)}
                  </div>
                </div>
                {expense.description && (
                  <div className="text-sm text-gray-600 mb-2">{expense.description}</div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  {expense.category && (
                    <span className="px-2 py-1 bg-white rounded-full">{expense.category}</span>
                  )}
                  {expense.recurrence_type !== RecurrenceType.NONE && (
                    <div className="flex items-center gap-1 text-danger-700 font-medium">
                      <Calendar size={12} />
                      <span>Recurring: {expense.recurrence_type}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onAddTransaction}
        className="fixed bottom-6 right-6 group w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-blue-600 hover:from-primary-600 hover:via-primary-700 hover:to-blue-700 text-white rounded-full shadow-xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-10"
        title="Add Transaction"
      >
        <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </div>
  );
};
