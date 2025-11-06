import { apiFetchJson } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';
import type { Reservation, ReservationFormData } from '@/lib/types';

export const reservationsApi = {
  getAll: async (params?: {
    status?: string;
    roomId?: string;
    guestEmail?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Reservation[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.roomId) queryParams.append('roomId', params.roomId);
    if (params?.guestEmail) queryParams.append('guestEmail', params.guestEmail);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const data = await apiFetchJson<
      | Reservation[]
      | { data?: Reservation[]; results?: Reservation[] }
      | { data?: { results?: Reservation[] } }
    >(
      queryString ? `${API_ENDPOINTS.reservations}?${queryString}` : API_ENDPOINTS.reservations,
    );
    if (Array.isArray(data)) return data;
    if (!data) return [];

    const directData = (data as { data?: Reservation[] }).data;
    if (Array.isArray(directData)) return directData;

    const directResults = (data as { results?: Reservation[] }).results;
    if (Array.isArray(directResults)) return directResults;

    const nestedResults = (data as { data?: { results?: Reservation[] } }).data?.results;
    if (Array.isArray(nestedResults)) return nestedResults;

    return [];
  },

  getById: async (id: string): Promise<Reservation> => {
    const data = await apiFetchJson<Reservation | { data: Reservation }>(
      `${API_ENDPOINTS.reservations}/${id}`,
    );
    return (data as { data?: Reservation }).data ?? (data as Reservation);
  },

  getAvailableRooms: async (checkIn: string, checkOut: string): Promise<{
    available: any[];
    reserved: any[];
  }> => {
    const queryParams = new URLSearchParams({ checkIn, checkOut });
    const data = await apiFetchJson<
      { available: any[]; reserved: any[] }
      | { data: { available: any[]; reserved: any[] } }
    >(`${API_ENDPOINTS.reservations}/rooms/available?${queryParams}`);

    if ('data' in data && data.data) {
      const { available = [], reserved = [] } = data.data;
      return { available, reserved };
    }

    const { available = [], reserved = [] } = data as { available?: any[]; reserved?: any[] };
    return { available, reserved };
  },

  getRoomsOverview: async (): Promise<any[]> => {
    const data = await apiFetchJson<any[] | { data: any[] }>(
      `${API_ENDPOINTS.reservations}/rooms/overview`,
    );
    return (data as { data?: any[] }).data ?? (data as any[]);
  },

  getByRoomNumber: async (roomNumber: string, futureOnly?: boolean): Promise<Reservation[]> => {
    const queryParams = futureOnly ? '?futureOnly=true' : '';
    const data = await apiFetchJson<Reservation[] | { data: Reservation[] }>(
      `${API_ENDPOINTS.reservations}/rooms/${roomNumber}/reservations${queryParams}`,
    );
    return (data as { data?: Reservation[] }).data ?? (data as Reservation[]);
  },

  create: async (reservation: ReservationFormData): Promise<Reservation> => {
    const data = await apiFetchJson<Reservation | { data: Reservation }>(API_ENDPOINTS.reservations, {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
    return (data as { data?: Reservation }).data ?? (data as Reservation);
  },

  update: async (id: string, reservation: ReservationFormData): Promise<Reservation> => {
    const data = await apiFetchJson<Reservation | { data: Reservation }>(
      `${API_ENDPOINTS.reservations}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(reservation),
      },
    );
    return (data as { data?: Reservation }).data ?? (data as Reservation);
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'completed'
  ): Promise<Reservation> => {
    const data = await apiFetchJson<Reservation | { data: Reservation }>(
      `${API_ENDPOINTS.reservations}/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );
    return (data as { data?: Reservation }).data ?? (data as Reservation);
  },
};
