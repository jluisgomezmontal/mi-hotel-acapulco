import { API_ENDPOINTS } from '../config';
import type { MonthlyReport } from '../types';

export const reportsApi = {
  getMonthly: async (year?: number, month?: number): Promise<MonthlyReport> => {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year.toString());
    if (month) queryParams.append('month', month.toString());

    const response = await fetch(`${API_ENDPOINTS.reports}/monthly?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch monthly report');
    const data = await response.json();
    return data.data || data;
  },
};
