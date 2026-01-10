import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Original exports (for backwards compatibility)
export { AppleMap } from './AppleMap';
export { BusinessMap } from './BusinessMap';
export { SimpleMap } from './SimpleMap';

// Dynamic imports for code splitting - use these for better performance
// Maps include heavy libraries (mapbox-gl) that should be lazy loaded

interface SimpleMapProps {
  latitude: number;
  longitude: number;
  businessName?: string;
  height?: string;
  zoom?: number;
  interactive?: boolean;
  showMarker?: boolean;
  className?: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  rating?: number;
  reviewCount?: number;
  category?: { name: string };
  primaryPhoto?: { url: string } | null;
  verified?: boolean;
}

interface BusinessMapProps {
  businesses: Business[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (business: Business) => void;
  showControls?: boolean;
  interactive?: boolean;
  className?: string;
}

// Map loading skeleton
const MapSkeleton = ({ height = '400px' }: { height?: string }) => (
  <div
    className="animate-pulse bg-white/5 rounded-xl flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-white/40 text-sm">Loading map...</div>
  </div>
);

export const DynamicSimpleMap: ComponentType<SimpleMapProps> = dynamic(
  () => import('./SimpleMap').then((mod) => mod.SimpleMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export const DynamicBusinessMap: ComponentType<BusinessMapProps> = dynamic(
  () => import('./BusinessMap').then((mod) => mod.BusinessMap),
  {
    ssr: false,
    loading: () => <MapSkeleton height="600px" />,
  }
);
