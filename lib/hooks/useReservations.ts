import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../api/reservations';
import type { ReservationFormData } from '../types';

export function useReservations(params?: {
  status?: string;
  roomId?: string;
  guestEmail?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationsApi.getAll(params),
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => reservationsApi.getById(id),
    enabled: !!id,
  });
}

export function useAvailableRooms(checkIn: string, checkOut: string) {
  return useQuery({
    queryKey: ['reservations', 'available-rooms', checkIn, checkOut],
    queryFn: () => reservationsApi.getAvailableRooms(checkIn, checkOut),
    enabled: !!checkIn && !!checkOut,
  });
}

export function useRoomsOverview() {
  return useQuery({
    queryKey: ['reservations', 'rooms-overview'],
    queryFn: reservationsApi.getRoomsOverview,
  });
}

export function useRoomReservations(roomNumber: string, futureOnly?: boolean) {
  return useQuery({
    queryKey: ['reservations', 'by-room', roomNumber, futureOnly],
    queryFn: () => reservationsApi.getByRoomNumber(roomNumber, futureOnly),
    enabled: !!roomNumber,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservation: ReservationFormData) => reservationsApi.create(reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'completed';
    }) => reservationsApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations', variables.id] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReservationFormData }) =>
      reservationsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
