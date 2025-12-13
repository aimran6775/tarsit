'use client';

import { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Navigation, X } from 'lucide-react';
import { toast } from 'sonner';

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
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  height?: string;
  onMarkerClick?: (business: Business) => void;
  showControls?: boolean;
  interactive?: boolean;
  className?: string;
}

export function BusinessMap({
  businesses,
  center,
  zoom = 12,
  height = '600px',
  onMarkerClick,
  showControls = true,
  interactive = true,
  className = '',
}: BusinessMapProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [viewState, setViewState] = useState({
    longitude: center?.[0] || -98.5795, // Default: center of USA
    latitude: center?.[1] || 39.8283,
    zoom: zoom,
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Get Mapbox token from env
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  // Calculate center from businesses if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (businesses.length === 0) return [-98.5795, 39.8283];
    
    const avgLng = businesses.reduce((sum, b) => sum + b.longitude, 0) / businesses.length;
    const avgLat = businesses.reduce((sum, b) => sum + b.latitude, 0) / businesses.length;
    return [avgLng, avgLat] as [number, number];
  }, [center, businesses]);

  // Update view state when center changes
  useMemo(() => {
    if (center) {
      setViewState(prev => ({
        ...prev,
        longitude: center[0],
        latitude: center[1],
      }));
    }
  }, [center]);

  const handleMarkerClick = useCallback((business: Business) => {
    setSelectedBusiness(business);
    onMarkerClick?.(business);
  }, [onMarkerClick]);

  const handleGetDirections = useCallback((business: Business) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
    window.open(url, '_blank');
  }, []);

  const handleGeolocate = useCallback((e: any) => {
    const { longitude, latitude } = e.coords;
    setUserLocation([longitude, latitude]);
    setViewState(prev => ({
      ...prev,
      longitude,
      latitude,
      zoom: 14,
    }));
    toast.success('Location found!');
  }, []);

  if (!mapboxToken) {
    return (
      <div 
        className={`bg-white/5 border border-white/10 rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-2">Map unavailable</p>
          <p className="text-sm text-white/40">Mapbox token not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-white/10 ${className}`} style={{ height }}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactive={interactive}
        attributionControl={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation[0]} latitude={userLocation[1]}>
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-500/30 rounded-full animate-ping" />
            </div>
          </Marker>
        )}

        {/* Business Markers */}
        {businesses.map((business) => (
          <Marker
            key={business.id}
            longitude={business.longitude}
            latitude={business.latitude}
            anchor="bottom"
            onClick={() => handleMarkerClick(business)}
          >
            <div className="relative cursor-pointer group">
              <div className="bg-white rounded-full p-1.5 shadow-lg transform transition-transform group-hover:scale-110">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </div>
              {/* Pulse animation */}
              <div className="absolute inset-0 w-8 h-8 rounded-full bg-purple-500/30 animate-ping" />
            </div>
          </Marker>
        ))}

        {/* Popup for selected business */}
        {selectedBusiness && (
          <Popup
            longitude={selectedBusiness.longitude}
            latitude={selectedBusiness.latitude}
            anchor="bottom"
            onClose={() => setSelectedBusiness(null)}
            closeButton={false}
            className="mapbox-popup"
          >
            <div className="bg-neutral-900 rounded-xl p-4 min-w-[280px] border border-white/10">
              <div className="flex items-start gap-3">
                {selectedBusiness.primaryPhoto?.url ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedBusiness.primaryPhoto.url}
                      alt={selectedBusiness.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white/40" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/business/${selectedBusiness.slug}`}
                      className="font-semibold text-white hover:text-purple-400 transition-colors truncate"
                    >
                      {selectedBusiness.name}
                    </Link>
                    {selectedBusiness.verified && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  {selectedBusiness.category && (
                    <p className="text-xs text-white/50 mb-2">{selectedBusiness.category.name}</p>
                  )}
                  
                  {selectedBusiness.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-white/70">
                        {selectedBusiness.rating.toFixed(1)}
                        {selectedBusiness.reviewCount && ` (${selectedBusiness.reviewCount})`}
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleGetDirections(selectedBusiness)}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors mt-2"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Get Directions
                  </button>
                </div>
                
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4 text-white/50" />
                </button>
              </div>
            </div>
          </Popup>
        )}

        {/* Map Controls */}
        {showControls && (
          <>
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />
            <GeolocateControl
              position="top-right"
              onGeolocate={handleGeolocate}
              showAccuracyCircle={false}
              showUserHeading={true}
            />
          </>
        )}
      </Map>
    </div>
  );
}

export default BusinessMap;
