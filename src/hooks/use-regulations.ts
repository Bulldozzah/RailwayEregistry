import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regulationService, type RegulationListParams, type CommentSubmission } from '@/services/regulations';

export function useRegulations(params: RegulationListParams = {}) {
  return useQuery({
    queryKey: ['regulations', params],
    queryFn: () => regulationService.list(params),
  });
}

export function useRegulation(id: number | string | undefined) {
  return useQuery({
    queryKey: ['regulation', id],
    queryFn: () => regulationService.getById(id!),
    enabled: !!id,
  });
}

export function useSubmitComment(regulationId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CommentSubmission) => regulationService.submitComment(regulationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulation', regulationId] });
    },
  });
}
