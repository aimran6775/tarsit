'use client';

import { useEffect, useId } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { useAppleMap } from '@/hooks/useAppleMap';

interface Business {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    city?: string;
    addressLine1?: string;
}

interface AppleMapProps {
    businesses?: Business[];
    center?: { lat: number; lng: number };
    zoom?: number;
    showUserLocation?: boolean;
    className?: string;
    onMarkerClick?: (businessId: string) => void;
    selectedBusinessId?: string;
}

export function AppleMap({
    businesses = [],
    center,
    zoom = 0.05,
    showUserLocation = true,
    className = '',
    onMarkerClick: _onMarkerClick,
    selectedBusinessId,
}: AppleMapProps) {
    const mapId = useId().replace(/:/g, '-');
    const containerId = `apple-map-${mapId}`;

    const {
        isLoaded,
        error,
        addMarkers,
        clearMarkers,
        setCenter,
        fitToMarkers,
    } = useAppleMap(containerId, {
        center,
        zoom,
        showUserLocation,
        darkMode: true,
    });

    // Add business markers when map loads
    useEffect(() => {
        if (!isLoaded) return;

        clearMarkers();

        const markers = businesses
            .filter((b) => b.latitude && b.longitude)
            .map((business) => ({
                id: business.id,
                lat: business.latitude!,
                lng: business.longitude!,
                title: business.name,
                subtitle: business.city || business.addressLine1 || '',
                color: business.id === selectedBusinessId ? '#6366f1' : '#a855f7',
                data: { business },
            }));

        if (markers.length > 0) {
            addMarkers(markers);

            // Fit map to show all markers
            if (markers.length > 1) {
                setTimeout(() => fitToMarkers(60), 100);
            } else if (markers.length === 1) {
                setCenter(markers[0].lat, markers[0].lng);
            }
        }
    }, [isLoaded, businesses, selectedBusinessId, addMarkers, clearMarkers, fitToMarkers, setCenter]);

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-neutral-900 rounded-xl ${className}`}>
                <div className="text-center p-8">
                    <MapPin className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 text-sm">Unable to load map</p>
                    <p className="text-white/30 text-xs mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            {/* Map Container */}
            <div
                id={containerId}
                className="w-full h-full min-h-[300px]"
                style={{ background: '#1a1a1a' }}
            />

            {/* Loading Overlay */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-3" />
                        <p className="text-white/50 text-sm">Loading map...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
