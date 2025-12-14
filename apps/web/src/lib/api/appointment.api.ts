import { apiClient } from './client';

export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  business: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  businessId: string;
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
}

export const appointmentApi = {
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>('/appointments/my');
    return response.data;
  },

  getBusinessAppointments: async (businessId: string): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>(`/appointments/business/${businessId}`);
    return response.data;
  },

  create: async (data: CreateAppointmentData): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>('/appointments', data);
    return response.data;
  },

  cancel: async (id: string): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/cancel`);
    return response.data;
  },

  confirm: async (id: string): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/confirm`);
    return response.data;
  },

  complete: async (id: string): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/complete`);
    return response.data;
  },

  getAvailableSlots: async (businessId: string, serviceId: string, date: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
      `/appointments/available?businessId=${businessId}&serviceId=${serviceId}&date=${date}`
    );
    return response.data;
  },
};
