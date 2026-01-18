import React from 'react';

import type { BudgetSummary } from '@/types';

interface BudgetOverviewProps {
  summary?: BudgetSummary;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="p-5 text-center text-gray-400">Loading budget summary...</div>
    );
  }

  const remainingPercentage =
    summary.total_income > 0 ? (summary.remaining / summary.total_income) * 100 : 0;

  const getProgressColor = () => {
    if (remainingPercentage > 20) return 'bg-success-500';
    if (remainingPercentage > 0) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">Budget Summary</h2>

      <div className="mb-5">
        <div className="flex justify-between mb-2 items-baseline">
          <span className="font-medium text-gray-500 text-sm">Total Income:</span>
          <span className="text-2xl font-bold text-success-600">
            €{summary.total_income.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between mb-2 items-baseline">
          <span className="font-medium text-gray-500 text-sm">Total Expenses:</span>
          <span className="text-2xl font-bold text-danger-600">
            €{summary.total_expenses.toFixed(2)}
          </span>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="mb-6">
        <div className="flex justify-between mb-3 items-baseline">
          <span className="font-semibold text-base text-gray-800">Remaining:</span>
          <span
            className={`text-3xl font-bold ${
              summary.remaining >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}
          >
            €{summary.remaining.toFixed(2)}
          </span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.max(0, Math.min(100, remainingPercentage))}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {remainingPercentage.toFixed(0)}% of income remaining
        </div>
      </div>

      <div className="mt-7">
        <h3 className="text-base mb-3 font-semibold text-gray-800">Daily Breakdown</h3>
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(summary.daily_balance).map(([day, balance]) => {
            if (balance.incomes === 0 && balance.expenses === 0) return null;
            return (
              <div
                key={day}
                className="p-2.5 mb-1.5 bg-gray-50 rounded-md flex justify-between text-sm border border-gray-200"
              >
                <span className="text-gray-600 font-medium">{balance.date}</span>
                <span
                  className={`font-semibold ${
                    balance.net >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {balance.net >= 0 ? '+' : ''}€{balance.net.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
