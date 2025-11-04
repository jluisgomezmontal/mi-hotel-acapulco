import { API_ENDPOINTS } from '../config';
import type { Guest, GuestFormData, GuestsListResponse } from '../types';

export const guestsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    documentType?: string;
  }): Promise<GuestsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.documentType) queryParams.append('documentType', params.documentType);

    const response = await fetch(`${API_ENDPOINTS.guests}?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch guests');
    const data = await response.json();

    return {
      guests: data.guests ?? data.results ?? [],
      total: data.total ?? data.count ?? 0,
      page: data.page ?? 1,
      pages: data.pages ?? data.totalPages ?? 1,
    } satisfies GuestsListResponse;
  },

  getById: async (id: string): Promise<Guest> => {
    const response = await fetch(`${API_ENDPOINTS.guests}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch guest');
    const data = await response.json();
    return data.data || data;
  },

  create: async (guest: GuestFormData): Promise<Guest> => {
    const response = await fetch(API_ENDPOINTS.guests, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guest),
    });
    if (!response.ok) throw new Error('Failed to create guest');
    const data = await response.json();
    return data.data || data;
  },

  update: async (id: string, guest: Partial<GuestFormData>): Promise<Guest> => {
    const response = await fetch(`${API_ENDPOINTS.guests}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guest),
    });
    if (!response.ok) throw new Error('Failed to update guest');
    const data = await response.json();
    return data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.guests}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete guest');
  },
};
