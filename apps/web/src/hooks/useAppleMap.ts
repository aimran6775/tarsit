'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { loadMapKit, getMapKit, createCoordinate, createRegion, DEFAULT_CENTER } from '@/lib/apple-maps';

interface UseAppleMapOptions {
    center?: { lat: number; lng: number };
    zoom?: number;
    showUserLocation?: boolean;
    darkMode?: boolean;
}

interface Marker {
    id: string;
    lat: number;
    lng: number;
    title?: string;
    subtitle?: string;
    color?: string;
    data?: any;
}

export function useAppleMap(containerId: string, options: UseAppleMapOptions = {}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const mapRef = useRef<mapkit.Map | null>(null);
    const markersRef = useRef<Map<string, mapkit.MarkerAnnotation>>(new Map());

    const {
        center = DEFAULT_CENTER,
        zoom = 0.05,
        showUserLocation = false,
        darkMode = true,
    } = options;

    // Initialize map
    useEffect(() => {
        let mounted = true;

        async function initMap() {
            try {
                await loadMapKit();

                if (!mounted) return;

                const mapkit = getMapKit();
                if (!mapkit) {
                    throw new Error('MapKit not available');
                }

                // Check if container exists
                const container = document.getElementById(containerId);
                if (!container) {
                    throw new Error(`Container #${containerId} not found`);
                }

                // Create the map
                const map = new mapkit.Map(containerId, {
                    center: createCoordinate(center.lat, center.lng),
                    region: createRegion(center.lat, center.lng, zoom, zoom),
                    showsUserLocation: showUserLocation,
                    showsUserLocationControl: showUserLocation,
                    showsCompass: 'Adaptive',
                    showsZoomControl: true,
                    showsMapTypeControl: false,
                    colorScheme: darkMode ? mapkit.ColorSchemes.Dark : mapkit.ColorSchemes.Light,
                    mapType: mapkit.MapTypes.MutedStandard,
                });

                mapRef.current = map;
                setIsLoaded(true);

                // Listen for user location updates
                if (showUserLocation) {
                    map.addEventListener('user-location-change', (event: any) => {
                        if (event.coordinate) {
                            setUserLocation({
                                lat: event.coordinate.latitude,
                                lng: event.coordinate.longitude,
                            });
                        }
                    });
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load map');
                }
            }
        }

        initMap();

        return () => {
            mounted = false;
            if (mapRef.current) {
                mapRef.current.destroy();
                mapRef.current = null;
            }
        };
    }, [containerId, center.lat, center.lng, zoom, showUserLocation, darkMode]);

    // Add a marker
    const addMarker = useCallback((marker: Marker) => {
        if (!mapRef.current || !getMapKit()) return;

        const mapkit = getMapKit()!;

        // Remove existing marker with same ID
        if (markersRef.current.has(marker.id)) {
            const existing = markersRef.current.get(marker.id)!;
            mapRef.current.removeAnnotation(existing);
        }

        const annotation = new mapkit.MarkerAnnotation(
            createCoordinate(marker.lat, marker.lng),
            {
                title: marker.title || '',
                subtitle: marker.subtitle || '',
                color: marker.color || '#a855f7', // Purple by default
                glyphColor: '#ffffff',
                data: { id: marker.id, ...marker.data },
            }
        );

        mapRef.current.addAnnotation(annotation);
        markersRef.current.set(marker.id, annotation);
    }, []);

    // Add multiple markers
    const addMarkers = useCallback((markers: Marker[]) => {
        markers.forEach(addMarker);
    }, [addMarker]);

    // Remove a marker
    const removeMarker = useCallback((id: string) => {
        if (!mapRef.current) return;

        const annotation = markersRef.current.get(id);
        if (annotation) {
            mapRef.current.removeAnnotation(annotation);
            markersRef.current.delete(id);
        }
    }, []);

    // Clear all markers
    const clearMarkers = useCallback(() => {
        if (!mapRef.current) return;

        markersRef.current.forEach((annotation) => {
            mapRef.current!.removeAnnotation(annotation);
        });
        markersRef.current.clear();
    }, []);

    // Set map center
    const setCenter = useCallback((lat: number, lng: number, animate = true) => {
        if (!mapRef.current) return;

        const newCenter = createCoordinate(lat, lng);
        if (animate) {
            mapRef.current.region = createRegion(lat, lng, zoom, zoom);
        } else {
            mapRef.current.center = newCenter;
        }
    }, [zoom]);

    // Fit map to show all markers
    const fitToMarkers = useCallback((padding = 50) => {
        if (!mapRef.current || markersRef.current.size === 0) return;

        const annotations = Array.from(markersRef.current.values());
        mapRef.current.showItems(annotations, {
            animate: true,
            padding: { top: padding, right: padding, bottom: padding, left: padding },
        });
    }, []);

    // Get user's current location
    const getUserLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    resolve(location);
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }, []);

    // Center on user location
    const centerOnUser = useCallback(async () => {
        try {
            const location = await getUserLocation();
            setCenter(location.lat, location.lng);
            return location;
        } catch (error) {
            console.error('Failed to get user location:', error);
            throw error;
        }
    }, [getUserLocation, setCenter]);

    return {
        isLoaded,
        error,
        map: mapRef.current,
        userLocation,
        addMarker,
        addMarkers,
        removeMarker,
        clearMarkers,
        setCenter,
        fitToMarkers,
        getUserLocation,
        centerOnUser,
    };
}
