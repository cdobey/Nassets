import { api } from '@/lib/api';
import type { BudgetSummary, CalendarResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useCalendar = (year: number, month: number) => {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async () => {
      const response = await api.get<CalendarResponse>(
        `/api/calendar?year=${year}&month=${month}`
      );
      return response.data;
    },
  });
};

export const useBudgetSummary = (year: number, month: number) => {
  return useQuery({
    queryKey: ['budget', year, month],
    queryFn: async () => {
      const response = await api.get<BudgetSummary>(
        `/api/budget/summary?year=${year}&month=${month}`
      );
      return response.data;
    },
  });
};
