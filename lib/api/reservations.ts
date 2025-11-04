import { API_ENDPOINTS } from '../config';
import type { Reservation, ReservationFormData } from '../types';

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
    const response = await fetch(
      queryString ? `${API_ENDPOINTS.reservations}?${queryString}` : API_ENDPOINTS.reservations,
    );
    if (!response.ok) throw new Error('Failed to fetch reservations');
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  },

  getById: async (id: string): Promise<Reservation> => {
    const response = await fetch(`${API_ENDPOINTS.reservations}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch reservation');
    const data = await response.json();
    return data.data || data;
  },

  getAvailableRooms: async (checkIn: string, checkOut: string): Promise<{
    available: any[];
    reserved: any[];
  }> => {
    const queryParams = new URLSearchParams({ checkIn, checkOut });
    const response = await fetch(
      `${API_ENDPOINTS.reservations}/rooms/available?${queryParams}`
    );
    if (!response.ok) throw new Error('Failed to fetch available rooms');
    const data = await response.json();
    return data.data || data;
  },

  getRoomsOverview: async (): Promise<any[]> => {
    const response = await fetch(`${API_ENDPOINTS.reservations}/rooms/overview`);
    if (!response.ok) throw new Error('Failed to fetch rooms overview');
    const data = await response.json();
    return data.data || data;
  },

  getByRoomNumber: async (roomNumber: string, futureOnly?: boolean): Promise<Reservation[]> => {
    const queryParams = futureOnly ? '?futureOnly=true' : '';
    const response = await fetch(
      `${API_ENDPOINTS.reservations}/rooms/${roomNumber}/reservations${queryParams}`
    );
    if (!response.ok) throw new Error('Failed to fetch room reservations');
    const data = await response.json();
    return data.data || data;
  },

  create: async (reservation: ReservationFormData): Promise<Reservation> => {
    const response = await fetch(API_ENDPOINTS.reservations, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (!response.ok) throw new Error('Failed to create reservation');
    const data = await response.json();
    return data.data || data;
  },

  update: async (id: string, reservation: ReservationFormData): Promise<Reservation> => {
    const response = await fetch(`${API_ENDPOINTS.reservations}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (!response.ok) throw new Error('Failed to update reservation');
    const data = await response.json();
    return data.data || data;
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'completed'
  ): Promise<Reservation> => {
    const response = await fetch(`${API_ENDPOINTS.reservations}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update reservation status');
    const data = await response.json();
    return data.data || data;
  },
};
