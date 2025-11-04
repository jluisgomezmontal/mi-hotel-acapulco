import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export function useMonthlyReport(year?: number, month?: number) {
  return useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => reportsApi.getMonthly(year, month),
  });
}
