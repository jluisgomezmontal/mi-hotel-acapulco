import { API_ENDPOINTS } from '@/lib/config';
import { apiFetchJson } from '@/lib/api/client';
import type { AuthResponse, User } from '@/lib/types';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterPayload extends Credentials {
  firstName: string;
  lastName: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiFetchJson<AuthResponse>(API_ENDPOINTS.auth + '/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login: async (payload: Credentials): Promise<AuthResponse> => {
    return apiFetchJson<AuthResponse>(API_ENDPOINTS.auth + '/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  me: async (): Promise<{ user: User }> => {
    return apiFetchJson<{ user: User }>(API_ENDPOINTS.auth + '/me');
  },
};
