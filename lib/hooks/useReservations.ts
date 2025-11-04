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
      status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
    }) => reservationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
