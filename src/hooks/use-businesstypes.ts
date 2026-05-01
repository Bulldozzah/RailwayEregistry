import { useQuery } from '@tanstack/react-query';
import { businessTypeService, type BusinessTypeListParams } from '@/services/businesstypes';

export function useBusinessTypes(params: BusinessTypeListParams = {}) {
  return useQuery({
    queryKey: ['businesstypes', params],
    queryFn: () => businessTypeService.list(params),
  });
}

export function useBusinessType(id: number | string | undefined) {
  return useQuery({
    queryKey: ['businesstype', id],
    queryFn: () => businessTypeService.getById(id!),
    enabled: !!id,
  });
}
