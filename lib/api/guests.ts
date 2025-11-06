import { apiFetch, apiFetchJson } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';
import type { Guest, GuestFormData, GuestsListResponse } from '@/lib/types';

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

    const raw = await apiFetchJson<unknown>(`${API_ENDPOINTS.guests}?${queryParams}`);

    if (!raw || typeof raw !== 'object') {
      return { guests: [], total: 0, page: 1, pages: 1 } satisfies GuestsListResponse;
    }

    const payload = raw as Partial<GuestsListResponse> & {
      results?: Guest[];
      count?: number;
      totalPages?: number;
    };

    const guests = Array.isArray(payload.guests)
      ? payload.guests
      : Array.isArray(payload.results)
        ? payload.results
        : [];

    const total =
      typeof payload.total === 'number'
        ? payload.total
        : typeof payload.count === 'number'
          ? payload.count
          : guests.length;

    const page = typeof payload.page === 'number' ? payload.page : 1;
    const pages =
      typeof payload.pages === 'number'
        ? payload.pages
        : typeof payload.totalPages === 'number'
          ? payload.totalPages
          : 1;

    return {
      guests,
      total,
      page,
      pages,
    } satisfies GuestsListResponse;
  },

  getById: async (id: string): Promise<Guest> => {
    const data = await apiFetchJson<Guest | { data: Guest }>(`${API_ENDPOINTS.guests}/${id}`);
    return (data as { data?: Guest }).data ?? (data as Guest);
  },

  create: async (guest: GuestFormData): Promise<Guest> => {
    const data = await apiFetchJson<Guest | { data: Guest }>(API_ENDPOINTS.guests, {
      method: 'POST',
      body: JSON.stringify(guest),
    });
    return (data as { data?: Guest }).data ?? (data as Guest);
  },

  update: async (id: string, guest: Partial<GuestFormData>): Promise<Guest> => {
    const data = await apiFetchJson<Guest | { data: Guest }>(`${API_ENDPOINTS.guests}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(guest),
    });
    return (data as { data?: Guest }).data ?? (data as Guest);
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch(`${API_ENDPOINTS.guests}/${id}`, {
      method: 'DELETE',
    });
  },
};
