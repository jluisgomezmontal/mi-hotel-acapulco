import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments';
import type { PaymentFormData, PaymentListResponse } from '../types';

export function usePayments(params?: {
  reservationId?: string;
  guestId?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.getAll(params),
    select: (data): PaymentListResponse => data,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
  });
}

export function useReservationPayments(reservationId: string) {
  return useQuery({
    queryKey: ['payments', 'by-reservation', reservationId],
    queryFn: () => paymentsApi.getByReservation(reservationId),
    enabled: !!reservationId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payment: PaymentFormData) => paymentsApi.create(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
