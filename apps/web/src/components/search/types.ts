// Search Component Types

export interface Region {
  id: string;
  code: string;
  name: string;
  flag: string;
  defaultLanguage: string;
  defaultCurrency: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: { id: string; name: string; slug: string };
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
  verified: boolean;
  featured: boolean;
  primaryPhoto: { id: string; url: string; featured: boolean } | null;
  distance?: number;
  phone?: string;
  email?: string;
  website?: string;
  amenities?: string[];
  hours?: BusinessHours;
  region?: Region | null;
  defaultLanguage?: string;
}

export interface BusinessHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  _count?: { businesses: number };
}

export interface SearchResponse {
  businesses: Business[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters?: {
    hasLocation: boolean;
    radius: number | null;
  };
  meta?: {
    searchTime: number;
    suggestions?: string[];
  };
}

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
  priceRange: string;
  rating: string;
  sortBy: string;
  amenities: string[];
  openNow: boolean;
  verified: boolean;
}

export interface SearchSuggestion {
  type: 'business' | 'category' | 'location' | 'recent' | 'popular' | 'ai';
  text: string;
  icon?: string;
  subtext?: string;
  slug?: string;
  highlight?: boolean;
}

export type ViewMode = 'grid' | 'list' | 'map' | 'compact';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  shortcut?: string;
}

// Filter Options
export const PRICE_OPTIONS = [
  { value: '', label: 'Any Price', icon: '💰' },
  { value: 'BUDGET', label: 'Budget', symbol: '$', description: 'Under $15' },
  { value: 'MODERATE', label: 'Moderate', symbol: '$$', description: '$15 - $40' },
  { value: 'EXPENSIVE', label: 'Premium', symbol: '$$$', description: '$40+' },
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any Rating', stars: 0 },
  { value: '4.5', label: 'Exceptional', stars: 4.5, description: '4.5+ stars' },
  { value: '4', label: 'Excellent', stars: 4, description: '4+ stars' },
  { value: '3.5', label: 'Very Good', stars: 3.5, description: '3.5+ stars' },
  { value: '3', label: 'Good', stars: 3, description: '3+ stars' },
];

export const SORT_OPTIONS = [
  {
    value: 'relevance',
    label: 'Most Relevant',
    icon: 'Sparkles',
    description: 'AI-powered ranking',
  },
  { value: 'rating', label: 'Highest Rated', icon: 'Star', description: 'Top rated first' },
  {
    value: 'reviews',
    label: 'Most Reviewed',
    icon: 'MessageSquare',
    description: 'Popular choices',
  },
  { value: 'distance', label: 'Nearest', icon: 'MapPin', description: 'Closest to you' },
  { value: 'newest', label: 'Recently Added', icon: 'Clock', description: 'New businesses' },
  { value: 'trending', label: 'Trending', icon: 'TrendingUp', description: 'Hot right now' },
];

export const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'Free WiFi', icon: 'Wifi' },
  { value: 'parking', label: 'Parking', icon: 'Car' },
  { value: 'wheelchair', label: 'Wheelchair Accessible', icon: 'Accessibility' },
  { value: 'pets', label: 'Pet Friendly', icon: 'PawPrint' },
  { value: 'outdoor', label: 'Outdoor Seating', icon: 'Sun' },
  { value: 'delivery', label: 'Delivery', icon: 'Truck' },
  { value: 'takeout', label: 'Takeout', icon: 'Package' },
  { value: 'reservations', label: 'Reservations', icon: 'Calendar' },
];

// Category Icons Map
export const CATEGORY_ICONS: Record<string, string> = {
  restaurants: '🍽️',
  'food-dining': '🍕',
  automotive: '🚗',
  'health-wellness': '💪',
  'beauty-spas': '💅',
  'home-services': '🏠',
  professional: '💼',
  shopping: '🛍️',
  entertainment: '🎭',
  education: '📚',
  technology: '💻',
  finance: '💳',
  travel: '✈️',
  default: '🏪',
};

// Category Colors Map
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  restaurants: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'food-dining': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  automotive: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'health-wellness': {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  'beauty-spas': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  'home-services': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  professional: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  shopping: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  default: { bg: 'bg-white/10', text: 'text-white/70', border: 'border-white/20' },
};
