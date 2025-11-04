import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/rooms';
import type { RoomFormData } from '../types';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
  });
}

export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Room id is required');
      }
      return roomsApi.getById(id);
    },
    enabled: !!id,
  });
}

export function useSearchRooms(params: {
  type?: string;
  minCapacity?: number;
  maxPrice?: number;
  available?: boolean;
}) {
  return useQuery({
    queryKey: ['rooms', 'search', params],
    queryFn: () => roomsApi.search(params),
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (room: RoomFormData) => roomsApi.create(room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoomFormData> }) =>
      roomsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.id] });
    },
  });
}

export function useUpdateRoomAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      roomsApi.updateAvailability(id, available),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.id] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.removeQueries({ queryKey: ['rooms', id] });
    },
  });
}
