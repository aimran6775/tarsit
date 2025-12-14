export interface Appointment {
  id: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoImage?: string;
    city: string;
    state: string;
    phone: string;
  };
  service?: {
    id: string;
    name: string;
    price?: number;
    duration?: number;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoImage?: string;
    coverImage?: string;
    description: string;
    city: string;
    state: string;
    rating: number;
    reviewCount: number;
    category: { name: string };
  };
}

export interface Chat {
  id: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoImage?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
  createdAt: string;
}

export type TabId = 'appointments' | 'favorites' | 'messages' | 'settings';
