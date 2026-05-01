import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsService.getDashboardStats(),
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => statsService.healthCheck(),
    refetchInterval: 30000,
  });
}
