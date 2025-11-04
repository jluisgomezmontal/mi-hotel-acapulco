import { API_ENDPOINTS } from '../config';
import type { Room, RoomFormData } from '../types';

export const roomsApi = {
  getAll: async (): Promise<Room[]> => {
    const response = await fetch(API_ENDPOINTS.rooms);
    if (!response.ok) throw new Error('Failed to fetch rooms');
    const data = await response.json();
    return data.data || data;
  },

  getById: async (id: string): Promise<Room> => {
    const response = await fetch(`${API_ENDPOINTS.rooms}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    const data = await response.json();
    return data.data || data;
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

    const response = await fetch(`${API_ENDPOINTS.rooms}/search?${queryParams}`);
    if (!response.ok) throw new Error('Failed to search rooms');
    const data = await response.json();
    return data.data || data;
  },

  create: async (room: RoomFormData): Promise<Room> => {
    const response = await fetch(API_ENDPOINTS.rooms, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    if (!response.ok) throw new Error('Failed to create room');
    const data = await response.json();
    return data.data || data;
  },

  update: async (id: string, room: Partial<RoomFormData>): Promise<Room> => {
    const response = await fetch(`${API_ENDPOINTS.rooms}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    if (!response.ok) throw new Error('Failed to update room');
    const data = await response.json();
    return data.data || data;
  },

  updateAvailability: async (id: string, available: boolean): Promise<Room> => {
    const response = await fetch(`${API_ENDPOINTS.rooms}/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: available }),
    });
    if (!response.ok) throw new Error('Failed to update availability');
    const data = await response.json();
    return data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.rooms}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete room');
  },
};
