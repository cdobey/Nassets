import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type {
  Income,
  IncomeCreate,
  Expense,
  ExpenseCreate,
  Saving,
  SavingCreate,
} from '@/types';

const QUERY_KEYS = {
  incomes: ['incomes'],
  expenses: ['expenses'],
  savings: ['savings'],
  assets: ['assets'],
  calendar: ['calendar'],
  budget: ['budget'],
};

const invalidateTransactionQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.incomes });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savings });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assets });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budget });
};

export const useIncomes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.incomes,
    queryFn: async () => {
      const response = await api.get<Income[]>('/api/incomes');
      return response.data;
    },
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IncomeCreate) => {
      const response = await api.post<Income>('/api/incomes', data);
      return response.data;
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<IncomeCreate> }) => {
      const response = await api.put<Income>(`/api/incomes/${id}`, data);
      return response.data;
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/incomes/${id}`);
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};

export const useExpenses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.expenses,
    queryFn: async () => {
      const response = await api.get<Expense[]>('/api/expenses');
      return response.data;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExpenseCreate) => {
      const response = await api.post<Expense>('/api/expenses', data);
      return response.data;
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExpenseCreate> }) => {
      const response = await api.put<Expense>(`/api/expenses/${id}`, data);
      return response.data;
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/expenses/${id}`);
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};

export const useCreateSaving = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SavingCreate) => {
      const response = await api.post<Saving>('/api/savings', data);
      return response.data;
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};

export const useSavings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.savings,
    queryFn: async () => {
      const response = await api.get<Saving[]>('/api/savings');
      return response.data;
    },
  });
};

export const useDeleteSaving = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/savings/${id}`);
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
};
