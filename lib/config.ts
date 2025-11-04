export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

export const API_ENDPOINTS = {
  rooms: `${API_URL}/api/rooms`,
  reservations: `${API_URL}/api/reservations`,
  guests: `${API_URL}/api/guests`,
  payments: `${API_URL}/api/payments`,
  reports: `${API_URL}/api/reports`,
} as const;
