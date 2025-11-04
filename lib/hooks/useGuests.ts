import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guestsApi } from '../api/guests';
import type { GuestFormData } from '../types';

export function useGuests(params?: {
  page?: number;
  limit?: number;
  search?: string;
  documentType?: string;
}) {
  return useQuery({
    queryKey: ['guests', params],
    queryFn: () => guestsApi.getAll(params),
  });
}

export function useGuest(id?: string) {
  return useQuery({
    queryKey: ['guests', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Guest id is required');
      }
      return guestsApi.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guest: GuestFormData) => guestsApi.create(guest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuestFormData> }) =>
      guestsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guests', variables.id] });
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => guestsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.removeQueries({ queryKey: ['guests', id] });
    },
  });
}
