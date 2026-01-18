export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Income {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  date: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  description: string | null;
}

export interface IncomeCreate {
  title: string;
  amount: number;
  date: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date?: string;
  description?: string;
}

export interface Expense {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  date: string;
  category: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  description: string | null;
}

export interface ExpenseCreate {
  title: string;
  amount: number;
  date: string;
  category?: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date?: string;
  description?: string;
}

export interface Saving {
  id: number;
  user_id: number;
  asset_id: number;
  title: string;
  amount: number;
  date: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  description: string | null;
  percentage: number;
}

export interface SavingCreate {
  asset_id: number;
  title: string;
  amount: number;
  date: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date?: string;
  description?: string;
  percentage: number;
}
