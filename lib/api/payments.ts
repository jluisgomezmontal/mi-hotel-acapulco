import { API_ENDPOINTS } from '../config';
import type { Payment, PaymentFormData } from '../types';

export const paymentsApi = {
  getAll: async (params?: {
    reservationId?: string;
    guestId?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Payment[]> => {
    const queryParams = new URLSearchParams();
    if (params?.reservationId) queryParams.append('reservationId', params.reservationId);
    if (params?.guestId) queryParams.append('guestId', params.guestId);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${API_ENDPOINTS.payments}?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch payments');
    const data = await response.json();
    return data.data || data;
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await fetch(`${API_ENDPOINTS.payments}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch payment');
    const data = await response.json();
    return data.data || data;
  },

  getByReservation: async (reservationId: string): Promise<{
    payments: Payment[];
    totalPaid: number;
    pendingBalance: number;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.payments}/reservation/${reservationId}`);
    if (!response.ok) throw new Error('Failed to fetch reservation payments');
    const data = await response.json();
    return data.data || data;
  },

  create: async (payment: PaymentFormData): Promise<Payment> => {
    const response = await fetch(API_ENDPOINTS.payments, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error('Failed to create payment');
    const data = await response.json();
    return data.data || data;
  },
};
