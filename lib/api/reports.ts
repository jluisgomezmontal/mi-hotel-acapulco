import { apiFetchJson } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/config';
import type { MonthlyReport } from '@/lib/types';

export const reportsApi = {
  getMonthly: async (year?: number, month?: number): Promise<MonthlyReport> => {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year.toString());
    if (month) queryParams.append('month', month.toString());

    const raw = await apiFetchJson<unknown>(
      `${API_ENDPOINTS.reports}/monthly?${queryParams}`,
    );

    if (!raw || typeof raw !== 'object') {
      throw new Error('No se pudo obtener el reporte mensual');
    }

    const payload =
      'data' in raw && raw.data && typeof raw.data === 'object' ? (raw.data as MonthlyReport) : raw;

    return payload as MonthlyReport;
  },
};
