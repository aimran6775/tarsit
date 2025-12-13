import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi, type Appointment } from '@/lib/api/appointment.api';
import { toast } from 'sonner';

// Query Keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: { status?: string; businessId?: string }) =>
    [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
  past: () => [...appointmentKeys.all, 'past'] as const,
};

// Get user appointments
export function useAppointments(filters?: { status?: string; businessId?: string }) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get upcoming appointments
export function useUpcomingAppointments() {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: () => appointmentApi.getUpcoming(),
    staleTime: 2 * 60 * 1000,
  });
}

// Get past appointments
export function usePastAppointments() {
  return useQuery({
    queryKey: appointmentKeys.past(),
    queryFn: () => appointmentApi.getPast(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single appointment
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentApi.getById(id),
    enabled: !!id,
  });
}

// Create appointment mutation
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      toast.success('Appointment booked successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to book appointment');
    },
  });
}

// Update appointment mutation
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      appointmentApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      toast.success('Appointment updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update appointment');
    },
  });
}

// Cancel appointment mutation
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });
}
