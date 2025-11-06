import { apiFetchJson } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';
import type { Payment, PaymentFormData, PaymentListResponse, Reservation } from '@/lib/types';

export const paymentsApi = {
  getAll: async (params?: {
    reservationId?: string;
    guestId?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.reservationId) queryParams.append('reservationId', params.reservationId);
    if (params?.guestId) queryParams.append('guestId', params.guestId);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const raw = await apiFetchJson<unknown>(`${API_ENDPOINTS.payments}?${queryParams}`);

    if (Array.isArray(raw)) {
      return {
        results: raw,
        count: raw.length,
        total: raw.length,
        totalPages: 1,
        page: 1,
        totalAmount: raw.reduce((sum: number, payment: Payment) => sum + payment.amount, 0),
      } satisfies PaymentListResponse;
    }

    if (!raw || typeof raw !== 'object') {
      return {
        results: [],
        count: 0,
        total: 0,
        totalPages: 1,
        page: 1,
        totalAmount: 0,
      } satisfies PaymentListResponse;
    }

    const payload = raw as {
      data?: PaymentListResponse | Payment[];
      results?: Payment[];
      count?: number;
      total?: number;
      totalPages?: number;
      page?: number;
      totalAmount?: number;
    } & Partial<PaymentListResponse>;

    const resolvedResults = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.results)
        ? payload.results
        : Array.isArray((payload.data as PaymentListResponse | undefined)?.results)
          ? (payload.data as PaymentListResponse).results
          : Array.isArray((payload as PaymentListResponse).results)
            ? (payload as PaymentListResponse).results
            : [];

    const count =
      payload.count ?? payload.total ?? (payload as PaymentListResponse).count ?? resolvedResults.length;

    const total =
      payload.total ??
      payload.count ??
      (payload as PaymentListResponse).total ??
      resolvedResults.length;

    const totalAmount =
      payload.totalAmount ??
      (payload as PaymentListResponse).totalAmount ??
      resolvedResults.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

    const page = payload.page ?? (payload as PaymentListResponse).page ?? 1;
    const totalPages = payload.totalPages ?? (payload as PaymentListResponse).totalPages ?? 1;

    return {
      results: resolvedResults,
      count,
      total,
      totalPages,
      page,
      totalAmount,
    } satisfies PaymentListResponse;
  },

  getById: async (id: string): Promise<Payment> => {
    const data = await apiFetchJson<Payment | { data: Payment }>(`${API_ENDPOINTS.payments}/${id}`);
    return (data as { data?: Payment }).data ?? (data as Payment);
  },

  getByReservation: async (reservationId: string): Promise<{
    payments: Payment[];
    totalPaid: number;
    pendingBalance: number;
  }> => {
    const raw = await apiFetchJson<unknown>(
      `${API_ENDPOINTS.payments}/reservation/${reservationId}`,
    );

    if (!raw || typeof raw !== 'object') {
      return { payments: [], totalPaid: 0, pendingBalance: 0 };
    }

    if ('data' in raw && raw.data && typeof raw.data === 'object') {
      const payload = raw.data as {
        payments?: Payment[];
        totalPaid?: number;
        pendingBalance?: number;
      };
      return {
        payments: Array.isArray(payload.payments) ? payload.payments : [],
        totalPaid: typeof payload.totalPaid === 'number' ? payload.totalPaid : 0,
        pendingBalance: typeof payload.pendingBalance === 'number' ? payload.pendingBalance : 0,
      };
    }

    const payload = raw as {
      payments?: Payment[];
      totalPaid?: number;
      pendingBalance?: number;
    };

    return {
      payments: Array.isArray(payload.payments) ? payload.payments : [],
      totalPaid: typeof payload.totalPaid === 'number' ? payload.totalPaid : 0,
      pendingBalance: typeof payload.pendingBalance === 'number' ? payload.pendingBalance : 0,
    };
  },

  create: async (
    payment: PaymentFormData,
  ): Promise<{
    payment: Payment;
    reservation?: Reservation;
  }> => {
    const raw = await apiFetchJson<unknown>(API_ENDPOINTS.payments, {
      method: 'POST',
      body: JSON.stringify(payment),
    });

    if (!raw || typeof raw !== 'object') {
      throw new Error('Respuesta inválida al crear el pago');
    }

    const payload =
      'data' in raw && raw.data && typeof raw.data === 'object' ? raw.data : raw;

    const typedPayload = payload as {
      payment?: Payment;
      reservation?: Reservation;
    };

    if (!typedPayload.payment) {
      throw new Error('Respuesta inválida al crear el pago');
    }

    return {
      payment: typedPayload.payment,
      reservation: typedPayload.reservation,
    };
  },
};
