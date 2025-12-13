// Business Dashboard Types

export type Tab = 'overview' | 'appointments' | 'reviews' | 'photos' | 'team' | 'hours' | 'settings';

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline?: string;
  rating: number;
  reviewCount: number;
  photos?: { url: string }[];
  coverImage?: string;
  logoImage?: string;
  category: { id: string; name: string };
  city: string;
  state: string;
  phone: string;
  email?: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  zipCode: string;
  verified: boolean;
  appointmentsEnabled: boolean;
  appointmentDuration?: number;
  appointmentBuffer?: number;
  advanceBookingDays?: number;
  services?: { id: string; name: string; price?: number }[];
  businessHours?: BusinessHours[];
}

export interface BusinessStats {
  totalViews: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalReviews: number;
  averageRating: number;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service?: { name: string; price?: number; duration?: number };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  role: string;
  canManageAppointments: boolean;
  canManageChat: boolean;
  canEditBusiness: boolean;
  canManageTeam: boolean;
  inviteStatus: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface BusinessHours {
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  helpful?: number;
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  createdAt: string;
  response?: string;
  respondedAt?: string;
}

export interface AppointmentSettings {
  appointmentsEnabled: boolean;
  appointmentDuration: number;
  appointmentBuffer: number;
  advanceBookingDays: number;
}

export interface InvitePermissions {
  canManageAppointments: boolean;
  canManageChat: boolean;
  canEditBusiness: boolean;
  canManageTeam: boolean;
}

// Helper function for status colors - dark theme
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'no_show': return 'bg-white/10 text-white/50 border-white/20';
    default: return 'bg-white/10 text-white/50 border-white/20';
  }
};
