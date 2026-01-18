import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
} from 'date-fns';
import type { CalendarResponse } from '@/types';
import { RecurrenceType } from '@/types';
import { getItemColor } from '@/utils';

interface CalendarViewProps {
  calendar?: CalendarResponse;
  year: number;
  month: number;
  currentDate: Date;
  selectedDay?: Date | null;
  viewMode: 'day' | 'week' | 'month' | 'year';
  onEditTransaction?: (id: number, type: 'income' | 'expense') => void;
  onDayClick?: (date: Date) => void;
  onAddTransaction?: () => void;
  onAssetDrop?: (date: Date, assetData: string) => void;
  isDraggingAsset?: boolean;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  calendar,
  year,
  month,
  currentDate,
  selectedDay,
  viewMode,
  onEditTransaction,
  onDayClick,
  onAddTransaction,
  onAssetDrop,
  isDraggingAsset,
}) => {
  const [hoveredTransaction, setHoveredTransaction] = useState<{
    id: number;
    type: 'income' | 'expense';
  } | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  if (!calendar) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-base">
        Loading calendar...
      </div>
    );
  }

  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);

  const getItemsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const incomes = calendar.incomes.filter((i) => i.occurrence_date === dayStr);
    const expenses = calendar.expenses.filter((e) => e.occurrence_date === dayStr);
    return { incomes, expenses };
  };

  const handleDrop = (day: Date, e: React.DragEvent) => {
    e.preventDefault();
    const assetData = e.dataTransfer.getData('asset');
    if (assetData && onAssetDrop) {
      onAssetDrop(day, assetData);
    }
  };

  const renderMonthView = () => {
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="font-semibold text-center py-3 text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 flex-1 overflow-hidden" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
          {days.map((day) => {
            const { incomes, expenses } = getItemsForDay(day);
            const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
            const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
            const hasItems = incomes.length > 0 || expenses.length > 0;
            const isCurrentMonth = day.getMonth() === month - 1;
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isSelected =
              selectedDay && format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');

            const dayKey = format(day, 'yyyy-MM-dd');
            const isHovered = hoveredDay === dayKey;
            const showDragHighlight = isDraggingAsset && isHovered && isCurrentMonth;

            return (
              <div
                key={day.toISOString()}
                onMouseEnter={() => setHoveredDay(dayKey)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.action-btn')) return;
                  onDayClick?.(day);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(day, e)}
                className={`
                  bg-white rounded-xl p-2 flex flex-col cursor-pointer transition-all duration-150
                  ${showDragHighlight ? 'bg-green-100 border-4 border-green-500 scale-105 shadow-lg z-10' : ''}
                  ${isSelected ? 'border-3 border-purple-400' : isToday ? 'border-2 border-blue-400' : 'border border-gray-200'}
                  ${isCurrentMonth ? 'opacity-100' : 'opacity-30'}
                  ${isHovered && !isDraggingAsset ? 'bg-gray-50' : ''}
                `}
                style={{ height: '100%' }}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span
                    className={`font-semibold text-sm ${isToday ? 'text-blue-500' : 'text-gray-800'}`}
                  >
                    {format(day, 'd')}
                  </span>
                  {isHovered && isCurrentMonth && (
                    <button
                      className="action-btn w-5 h-5 rounded bg-blue-500 text-white text-sm font-bold flex items-center justify-center hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTransaction?.();
                      }}
                      title="Add Transaction"
                    >
                      +
                    </button>
                  )}
                </div>

                <div
                  className={`flex-1 flex flex-col gap-1 overflow-hidden ${isHovered ? 'overflow-y-auto' : ''}`}
                >
                  {incomes.map((income, idx) => (
                    <div
                      key={`income-${idx}`}
                      onClick={() => onEditTransaction?.(income.id, 'income')}
                      onMouseEnter={() => setHoveredTransaction({ id: income.id, type: 'income' })}
                      onMouseLeave={() => setHoveredTransaction(null)}
                      className={`text-xs px-1.5 py-1 rounded font-medium whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-transform ${
                        hoveredTransaction?.id === income.id &&
                        hoveredTransaction?.type === 'income'
                          ? 'scale-105'
                          : ''
                      }`}
                      style={{
                        backgroundColor: getItemColor(
                          income.title,
                          'salary',
                          income.recurrence_type !== RecurrenceType.NONE
                        ),
                        color: '#22543d',
                        border:
                          income.recurrence_type !== RecurrenceType.NONE
                            ? '1px dashed #48bb78'
                            : 'none',
                        minHeight: '24px',
                      }}
                      title={`${income.title}: €${income.amount}${
                        income.recurrence_type !== RecurrenceType.NONE
                          ? ` (${income.recurrence_type})`
                          : ''
                      }`}
                    >
                      💰 {income.title}
                      <span className="float-right font-semibold ml-1">€{income.amount}</span>
                    </div>
                  ))}

                  {expenses.map((expense, idx) => (
                    <div
                      key={`expense-${idx}`}
                      onClick={() => onEditTransaction?.(expense.id, 'expense')}
                      onMouseEnter={() =>
                        setHoveredTransaction({ id: expense.id, type: 'expense' })
                      }
                      onMouseLeave={() => setHoveredTransaction(null)}
                      className={`text-xs px-1.5 py-1 rounded font-medium whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-transform ${
                        hoveredTransaction?.id === expense.id &&
                        hoveredTransaction?.type === 'expense'
                          ? 'scale-105'
                          : ''
                      }`}
                      style={{
                        backgroundColor: getItemColor(
                          expense.title,
                          expense.category,
                          expense.recurrence_type !== RecurrenceType.NONE
                        ),
                        color: '#742a2a',
                        border:
                          expense.recurrence_type !== RecurrenceType.NONE
                            ? '1px dashed #f56565'
                            : 'none',
                        minHeight: '24px',
                      }}
                      title={`${expense.title}: €${expense.amount}${
                        expense.recurrence_type !== RecurrenceType.NONE
                          ? ` (${expense.recurrence_type})`
                          : ''
                      }`}
                    >
                      📌 {expense.title}
                      <span className="float-right font-semibold ml-1">€{expense.amount}</span>
                    </div>
                  ))}
                </div>

                {hasItems && (
                  <div className="mt-1.5 pt-1.5 border-t border-gray-200 text-xs font-semibold text-right">
                    <span
                      className={totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {totalIncome - totalExpense >= 0 ? '+' : ''}€
                      {(totalIncome - totalExpense).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

    return (
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-7 gap-3 h-full">
          {weekDays.map((day) => {
            const { incomes, expenses } = getItemsForDay(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={day.toISOString()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(day, e)}
                className={`bg-white rounded-lg p-4 flex flex-col overflow-auto ${
                  isToday ? 'border-2 border-blue-400' : 'border border-gray-200'
                }`}
              >
                <div className="mb-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">{format(day, 'EEE')}</div>
                  <div
                    className={`text-2xl font-semibold ${isToday ? 'text-blue-500' : 'text-gray-800'}`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {incomes.map((income, idx) => (
                    <div
                      key={`income-${idx}`}
                      onClick={() => onEditTransaction?.(income.id, 'income')}
                      className="p-2 rounded-md cursor-pointer transition-transform hover:scale-105"
                      style={{
                        backgroundColor: getItemColor(
                          income.title,
                          'salary',
                          income.recurrence_type !== RecurrenceType.NONE
                        ),
                        border:
                          income.recurrence_type !== RecurrenceType.NONE
                            ? '2px dashed #48bb78'
                            : 'none',
                      }}
                    >
                      <div className="text-sm font-semibold text-green-800 mb-1">{income.title}</div>
                      <div className="text-base font-bold text-green-600">€{income.amount}</div>
                      {income.recurrence_type !== RecurrenceType.NONE && (
                        <div className="text-xs text-gray-500 mt-1">{income.recurrence_type}</div>
                      )}
                    </div>
                  ))}

                  {expenses.map((expense, idx) => (
                    <div
                      key={`expense-${idx}`}
                      onClick={() => onEditTransaction?.(expense.id, 'expense')}
                      className="p-2 rounded-md cursor-pointer transition-transform hover:scale-105"
                      style={{
                        backgroundColor: getItemColor(
                          expense.title,
                          expense.category,
                          expense.recurrence_type !== RecurrenceType.NONE
                        ),
                        border:
                          expense.recurrence_type !== RecurrenceType.NONE
                            ? '2px dashed #f56565'
                            : 'none',
                      }}
                    >
                      <div className="text-sm font-semibold text-red-800 mb-1">{expense.title}</div>
                      <div className="text-base font-bold text-red-600">€{expense.amount}</div>
                      {expense.category && (
                        <div className="text-xs text-gray-500 mt-0.5">{expense.category}</div>
                      )}
                      {expense.recurrence_type !== RecurrenceType.NONE && (
                        <div className="text-xs text-gray-500">{expense.recurrence_type}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(yearStart);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="h-full flex flex-col">
        <div className="flex gap-4 overflow-x-auto overflow-y-hidden p-2 h-full">
          {months.map((monthDate, monthIdx) => {
            const mStart = startOfMonth(monthDate);
            const mEnd = endOfMonth(mStart);
            const calendarStart = startOfWeek(mStart);
            const calendarEnd = endOfWeek(mEnd);
            const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

            const monthIncomes = calendar.incomes.filter((i) => {
              const d = new Date(i.occurrence_date);
              return d.getMonth() === monthIdx && d.getFullYear() === year;
            });
            const monthExpenses = calendar.expenses.filter((e) => {
              const d = new Date(e.occurrence_date);
              return d.getMonth() === monthIdx && d.getFullYear() === year;
            });
            const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
            const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
            const netAmount = totalIncome - totalExpense;

            return (
              <div
                key={monthIdx}
                className="min-w-80 max-w-80 bg-white rounded-xl p-4 shadow-md flex flex-col border-2 border-gray-200"
              >
                <div className="mb-3">
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    {format(monthDate, 'MMMM')}
                  </div>
                  <div className="flex gap-2 text-xs p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-gray-500 mb-0.5">Income</div>
                      <div className="text-green-600 font-bold">€{totalIncome.toFixed(0)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-500 mb-0.5">Expenses</div>
                      <div className="text-red-600 font-bold">€{totalExpense.toFixed(0)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-500 mb-0.5">Net</div>
                      <div
                        className={`font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {netAmount >= 0 ? '+' : ''}€{netAmount.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5 text-xs">
                  {WEEKDAYS_SHORT.map((day, idx) => (
                    <div key={idx} className="text-center font-semibold text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                  {days.map((day) => {
                    const { incomes, expenses } = getItemsForDay(day);
                    const dayTotal =
                      incomes.reduce((sum, i) => sum + i.amount, 0) -
                      expenses.reduce((sum, e) => sum + e.amount, 0);
                    const isCurrentMonth = day.getMonth() === monthIdx;
                    const isToday =
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    const hasItems = incomes.length > 0 || expenses.length > 0;

                    return (
                      <div
                        key={day.toISOString()}
                        className={`aspect-square flex items-center justify-center rounded text-xs font-medium transition-all ${
                          isToday
                            ? 'bg-blue-500 text-white'
                            : hasItems
                              ? dayTotal >= 0
                                ? 'bg-green-100 text-green-800 font-bold'
                                : 'bg-red-100 text-red-800 font-bold'
                              : 'text-gray-800'
                        } ${isCurrentMonth ? 'opacity-100' : 'opacity-30'} ${hasItems ? 'cursor-pointer' : ''}`}
                        title={hasItems ? `€${dayTotal.toFixed(0)}` : ''}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                </div>

                {(monthExpenses.length > 0 || monthIncomes.length > 0) && (
                  <div className="mt-3 pt-3 border-t-2 border-gray-200 max-h-48 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-800 mb-1.5">Transactions</div>
                    <div className="flex flex-col gap-1">
                      {monthIncomes.map((income, idx) => (
                        <div
                          key={`mini-income-${idx}`}
                          className="px-1.5 py-1 rounded bg-green-100 text-xs flex justify-between items-center gap-1"
                        >
                          <span className="text-green-800 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                            {income.title}
                          </span>
                          <span className="text-green-600 font-bold whitespace-nowrap">
                            €{income.amount.toFixed(0)}
                          </span>
                        </div>
                      ))}
                      {monthExpenses.map((expense, idx) => (
                        <div
                          key={`mini-expense-${idx}`}
                          className="px-1.5 py-1 rounded bg-red-100 text-xs flex justify-between items-center gap-1"
                        >
                          <span className="text-red-800 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                            {expense.title}
                          </span>
                          <span className="text-red-600 font-bold whitespace-nowrap">
                            €{expense.amount.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const { incomes, expenses } = getItemsForDay(currentDate);

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(currentDate, e)}
        className="bg-white rounded-lg p-6 h-full overflow-auto"
      >
        <h2 className="mb-6 text-3xl font-semibold text-gray-800">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>

        <div className="flex flex-col gap-3">
          {incomes.length === 0 && expenses.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-base">
              No transactions scheduled for this day
            </div>
          )}

          {incomes.map((income, idx) => (
            <div
              key={`income-${idx}`}
              onClick={() => onEditTransaction?.(income.id, 'income')}
              className="p-4 rounded-lg cursor-pointer transition-transform hover:scale-101"
              style={{
                backgroundColor: getItemColor(
                  income.title,
                  'salary',
                  income.recurrence_type !== RecurrenceType.NONE
                ),
                border:
                  income.recurrence_type !== RecurrenceType.NONE
                    ? '2px dashed #48bb78'
                    : '1px solid #c6f6d5',
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold text-green-800 mb-1">💰 {income.title}</div>
                  {income.description && (
                    <div className="text-sm text-gray-500">{income.description}</div>
                  )}
                  {income.recurrence_type !== RecurrenceType.NONE && (
                    <div className="text-xs text-green-600 mt-1 font-semibold">
                      Recurring: {income.recurrence_type}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-green-600">€{income.amount}</div>
              </div>
            </div>
          ))}

          {expenses.map((expense, idx) => (
            <div
              key={`expense-${idx}`}
              onClick={() => onEditTransaction?.(expense.id, 'expense')}
              className="p-4 rounded-lg cursor-pointer transition-transform hover:scale-101"
              style={{
                backgroundColor: getItemColor(
                  expense.title,
                  expense.category,
                  expense.recurrence_type !== RecurrenceType.NONE
                ),
                border:
                  expense.recurrence_type !== RecurrenceType.NONE
                    ? '2px dashed #f56565'
                    : '1px solid #fed7d7',
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold text-red-800 mb-1">📌 {expense.title}</div>
                  {expense.description && (
                    <div className="text-sm text-gray-500">{expense.description}</div>
                  )}
                  <div className="flex gap-3 mt-1">
                    {expense.category && (
                      <span className="text-xs text-gray-400">Category: {expense.category}</span>
                    )}
                    {expense.recurrence_type !== RecurrenceType.NONE && (
                      <span className="text-xs text-red-600 font-semibold">
                        Recurring: {expense.recurrence_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">€{expense.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  switch (viewMode) {
    case 'month':
      return renderMonthView();
    case 'week':
      return renderWeekView();
    case 'year':
      return renderYearView();
    case 'day':
      return renderDayView();
    default:
      return renderMonthView();
  }
};
