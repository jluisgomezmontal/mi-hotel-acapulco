import { apiFetchJson } from './client';
import { unwrapPayload } from './helpers';
import { API_ENDPOINTS } from '../config';
import type { Room, RoomFormData } from '../types';

export const roomsApi = {
  getAll: async (): Promise<Room[]> => {
    const data = await apiFetchJson<Room[] | { data?: Room[] }>(API_ENDPOINTS.rooms);
    return unwrapPayload(data);
  },

  getById: async (id: string): Promise<Room> => {
    const data = await apiFetchJson<Room | { data?: Room }>(`${API_ENDPOINTS.rooms}/${id}`);
    return unwrapPayload(data);
  },

  search: async (params: {
    type?: string;
    minCapacity?: number;
    maxPrice?: number;
    available?: boolean;
  }): Promise<Room[]> => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', params.type);
    if (params.minCapacity) queryParams.append('minCapacity', params.minCapacity.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.available !== undefined) queryParams.append('available', params.available.toString());

    const data = await apiFetchJson<Room[] | { data?: Room[] }>(
      `${API_ENDPOINTS.rooms}/search?${queryParams}`,
    );
    return unwrapPayload(data);
  },

  create: async (room: RoomFormData): Promise<Room> => {
    const data = await apiFetchJson<Room | { data?: Room }>(API_ENDPOINTS.rooms, {
      method: 'POST',
      body: JSON.stringify(room),
    });
    return unwrapPayload(data);
  },

  update: async (id: string, room: Partial<RoomFormData>): Promise<Room> => {
    const data = await apiFetchJson<Room | { data?: Room }>(`${API_ENDPOINTS.rooms}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room),
    });
    return unwrapPayload(data);
  },

  updateAvailability: async (id: string, available: boolean): Promise<Room> => {
    const data = await apiFetchJson<Room | { data?: Room }>(
      `${API_ENDPOINTS.rooms}/${id}/availability`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: available }),
      },
    );
    return unwrapPayload(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiFetchJson<void>(`${API_ENDPOINTS.rooms}/${id}`, {
      method: 'DELETE',
    });
  },
};
