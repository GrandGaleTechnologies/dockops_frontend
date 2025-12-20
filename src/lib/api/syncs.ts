import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';
import { getErrorMessage } from './utils';
import { PaginatedResponse } from './types';

export interface Sync {
  id: number;
  project_id: number;
  integration: 'acc' | 'drone_deploy' | 'other';
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  synced: boolean;
  duration_ms: number;
  s3_file_key: string;
  acc_file_id: string;
  created_at: string;
  updated_at: string;
}

export interface SyncsQueryParams {
  status?: 'pending' | 'in_progress' | 'success' | 'failed' | null;
  integration?: 'acc' | 'drone_deploy' | 'other' | null;
  synced?: boolean | null;
  q?: string;
  page?: number;
  size?: number;
  order_by?: 'asc' | 'desc';
}

export interface CreateSyncData {
  integration: 'acc' | 'drone_deploy' | 'other';
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  synced: boolean;
  duration_ms: number;
  project_id: number;
  s3_file_key: string;
  acc_file_id: string;
}

// Response structure for single sync
interface SyncResponse {
  msg: string;
  data: Sync;
}

// Raw API function
export const syncsAPI = {
  /**
   * Get syncs with pagination and filters
   */
  getSyncs: async (params: SyncsQueryParams = {}): Promise<PaginatedResponse<Sync>> => {
    try {
      const searchParams = new URLSearchParams();

      if (params.status !== undefined && params.status !== null) {
        searchParams.append('status', params.status);
      }
      if (params.integration !== undefined && params.integration !== null) {
        searchParams.append('integration', params.integration);
      }
      if (params.synced !== undefined && params.synced !== null) {
        searchParams.append('synced', String(params.synced));
      }
      if (params.q) {
        searchParams.append('q', params.q);
      }
      if (params.page !== undefined) {
        searchParams.append('page', String(params.page));
      }
      if (params.size !== undefined) {
        searchParams.append('size', String(params.size));
      }
      if (params.order_by) {
        searchParams.append('order_by', params.order_by);
      }

      const response = await apiClient.get<PaginatedResponse<Sync>>(
        `/syncs?${searchParams.toString()}`
      );

      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get a single sync by ID
   */
  getSync: async (syncId: string | number): Promise<Sync> => {
    try {
      const response = await apiClient.get<SyncResponse>(`/syncs/${syncId}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Trigger a manual sync for a project
   */
  triggerManualSync: async (projectId: string | number): Promise<string> => {
    try {
      const response = await apiClient.post<{ msg: string; data: string }>(
        `/syncs/manual/${projectId}`,
        {}
      );
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete a sync
   */
  deleteSync: async (syncId: string | number): Promise<void> => {
    try {
      await apiClient.delete(`/syncs/${syncId}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Create a new sync
   */
  createSync: async (data: CreateSyncData): Promise<Sync> => {
    try {
      const response = await apiClient.post<SyncResponse>('/syncs', data);
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },
};

// React Query hooks
export const useSyncs = (params: SyncsQueryParams = {}) => {
  return useQuery({
    queryKey: ['syncs', params],
    queryFn: () => syncsAPI.getSyncs(params),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

export const useSync = (syncId: string | number | null, enabled = true) => {
  return useQuery({
    queryKey: ['sync', syncId],
    queryFn: () => syncsAPI.getSync(syncId!),
    enabled: enabled && syncId !== null,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

export const useTriggerManualSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string | number) => syncsAPI.triggerManualSync(projectId),
    onSuccess: () => {
      // Invalidate and refetch syncs list
      queryClient.invalidateQueries({ queryKey: ['syncs'] });
    },
    onError: (error) => {
      console.error('Trigger manual sync failed:', getErrorMessage(error));
    },
  });
};

export const useDeleteSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (syncId: string | number) => syncsAPI.deleteSync(syncId),
    onSuccess: () => {
      // Invalidate and refetch syncs list
      queryClient.invalidateQueries({ queryKey: ['syncs'] });
    },
    onError: (error) => {
      console.error('Delete sync failed:', getErrorMessage(error));
    },
  });
};

export const useCreateSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSyncData) => syncsAPI.createSync(data),
    onSuccess: () => {
      // Invalidate and refetch syncs list
      queryClient.invalidateQueries({ queryKey: ['syncs'] });
    },
    onError: (error) => {
      console.error('Create sync failed:', getErrorMessage(error));
    },
  });
};

