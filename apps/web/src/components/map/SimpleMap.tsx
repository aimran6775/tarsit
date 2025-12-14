'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';

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

export function SimpleMap({
  latitude,
  longitude,
  businessName,
  height = '400px',
  zoom = 14,
  interactive = true,
  showMarker = true,
  className = '',
}: SimpleMapProps) {
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom,
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const handleGetDirections = useCallback(() => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  }, [latitude, longitude]);

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
        {showMarker && (
          <Marker longitude={longitude} latitude={latitude} anchor="bottom">
            <div className="relative">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 w-10 h-10 rounded-full bg-purple-500/30 animate-ping" />
            </div>
          </Marker>
        )}

        {interactive && (
          <>
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />
          </>
        )}
      </Map>

      {/* Get Directions Button */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center">
          <button
            onClick={handleGetDirections}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </button>
        </div>
      )}
    </div>
  );
}

export default SimpleMap;
