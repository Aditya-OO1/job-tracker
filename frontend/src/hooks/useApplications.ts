import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '@/services/api';
import { ApplicationFormData, KanbanStatus } from '@/types';
import toast from 'react-hot-toast';

export const APPLICATIONS_KEY = ['applications'] as const;

export function useApplications() {
  return useQuery({
    queryKey: APPLICATIONS_KEY,
    queryFn: applicationsApi.getAll,
    staleTime: 1000 * 30,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ApplicationFormData>) => applicationsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPLICATIONS_KEY });
      toast.success('Application added!');
    },
    onError: () => toast.error('Failed to create application'),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ApplicationFormData & { status: KanbanStatus }> }) =>
      applicationsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPLICATIONS_KEY });
    },
    onError: () => toast.error('Failed to update application'),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPLICATIONS_KEY });
      toast.success('Application deleted');
    },
    onError: () => toast.error('Failed to delete application'),
  });
}
