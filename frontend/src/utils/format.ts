import { format } from 'date-fns';

export const formatCurrency = (amount: number, currency = '€'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

export const formatCurrencyShort = (amount: number, currency = '€'): string => {
  return `${currency}${amount.toFixed(0)}`;
};

export const formatDate = (date: Date | string, formatStr = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr);
};

export const formatDateLong = (date: Date | string): string => {
  return formatDate(date, 'EEEE, MMMM d, yyyy');
};

export const formatDateShort = (date: Date | string): string => {
  return formatDate(date, 'MMM d, yyyy');
};
