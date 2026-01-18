import { RecurrenceType } from './transaction';

export interface CalendarItem {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  date: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  description: string | null;
  category?: string | null;
  occurrence_date: string;
  is_recurring: boolean;
}

export interface CalendarResponse {
  incomes: CalendarItem[];
  expenses: CalendarItem[];
  savings: CalendarItem[];
  month: number;
  year: number;
}

export interface DailyBalance {
  date: string;
  incomes: number;
  expenses: number;
  savings: number;
  net: number;
}

export interface BudgetSummary {
  month: number;
  year: number;
  total_income: number;
  total_expenses: number;
  total_savings: number;
  remaining: number;
  daily_balance: Record<number, DailyBalance>;
}
