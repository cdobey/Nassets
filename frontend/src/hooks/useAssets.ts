import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { Asset, AssetCreate, AssetUpdate } from '@/types';

const QUERY_KEYS = {
  assets: ['assets'],
  savings: ['savings'],
  calendar: ['calendar'],
  budget: ['budget'],
};

const invalidateAssetQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assets });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savings });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendar });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budget });
};

export const useAssets = () => {
  return useQuery({
    queryKey: QUERY_KEYS.assets,
    queryFn: async () => {
      const response = await api.get<Asset[]>('/api/assets');
      return response.data;
    },
  });
};

export const useAsset = (assetId: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.assets, assetId],
    queryFn: async () => {
      const response = await api.get<Asset>(`/api/assets/${assetId}`);
      return response.data;
    },
    enabled: !!assetId,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssetCreate) => {
      const response = await api.post<Asset>('/api/assets', data);
      return response.data;
    },
    onSuccess: () => invalidateAssetQueries(queryClient),
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AssetUpdate }) => {
      const response = await api.put<Asset>(`/api/assets/${id}`, data);
      return response.data;
    },
    onSuccess: () => invalidateAssetQueries(queryClient),
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/assets/${id}`);
    },
    onSuccess: () => invalidateAssetQueries(queryClient),
  });
};
