export interface BusinessDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline?: string;
  category: { id: string; name: string; slug: string };
  owner?: { id: string; firstName: string; lastName: string; email?: string };
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  website?: string;
  priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  appointmentsEnabled: boolean;
  coverImage?: string;
  logoImage?: string;
  themeColor?: string;
  photos: Array<{ id: string; url: string; caption?: string; featured: boolean }>;
  services: Array<{ 
    id: string; 
    name: string; 
    description?: string; 
    price?: number; 
    duration?: number; 
    bookable: boolean 
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    photos?: string[];
    helpful?: number;
    createdAt: string;
    user: { id: string; firstName: string; lastName: string; avatar?: string };
    response?: string;
    respondedAt?: string;
  }>;
}

export interface BusinessHours {
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}
