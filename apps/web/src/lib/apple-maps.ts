// Apple MapKit JS integration
// Documentation: https://developer.apple.com/documentation/mapkitjs

declare global {
    interface Window {
        mapkit: typeof mapkit;
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace mapkit {
        function init(options: { authorizationCallback: (done: (token: string) => void) => void }): void;

        class Map {
        constructor(element: string | HTMLElement, options?: MapConstructorOptions);
        center: Coordinate;
        region: CoordinateRegion;
        showsUserLocation: boolean;
        showsUserLocationControl: boolean;
        showsCompass: string;
        showsZoomControl: boolean;
        showsMapTypeControl: boolean;
        annotations: Annotation[];
        addAnnotation(annotation: Annotation): void;
        addAnnotations(annotations: Annotation[]): void;
        removeAnnotation(annotation: Annotation): void;
        removeAnnotations(annotations: Annotation[]): void;
        showItems(items: Annotation[], options?: { animate?: boolean; padding?: Padding }): void;
        destroy(): void;
        addEventListener(type: string, listener: (event: any) => void): void;
    }

    class Coordinate {
        constructor(latitude: number, longitude: number);
        latitude: number;
        longitude: number;
    }

    class CoordinateRegion {
        constructor(center: Coordinate, span: CoordinateSpan);
    }

    class CoordinateSpan {
        constructor(latitudeDelta: number, longitudeDelta: number);
    }

    class MarkerAnnotation {
        constructor(coordinate: Coordinate, options?: MarkerAnnotationOptions);
        coordinate: Coordinate;
        title: string;
        subtitle: string;
        data: any;
        color: string;
        glyphColor: string;
        glyphText: string;
        selected: boolean;
    }

    class Annotation {
        constructor(coordinate: Coordinate, factory: (coordinate: Coordinate, options: any) => HTMLElement, options?: AnnotationOptions);
    }

    class Search {
        constructor(options?: { region?: CoordinateRegion });
        search(query: string, callback: (error: Error | null, data: SearchResponse) => void): void;
        autocomplete(query: string, callback: (error: Error | null, data: AutocompleteResponse) => void): void;
    }

    class Geocoder {
        lookup(place: string, callback: (error: Error | null, data: GeocoderResponse) => void): void;
        reverseLookup(coordinate: Coordinate, callback: (error: Error | null, data: GeocoderResponse) => void): void;
    }

    interface MapConstructorOptions {
        center?: Coordinate;
        region?: CoordinateRegion;
        showsUserLocation?: boolean;
        showsUserLocationControl?: boolean;
        showsCompass?: string;
        showsZoomControl?: boolean;
        showsMapTypeControl?: boolean;
        colorScheme?: string;
        mapType?: string;
        padding?: Padding;
    }

    interface Padding {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }

    interface MarkerAnnotationOptions {
        title?: string;
        subtitle?: string;
        color?: string;
        glyphColor?: string;
        glyphText?: string;
        data?: any;
        selected?: boolean;
        callout?: any;
    }

    interface AnnotationOptions {
        title?: string;
        subtitle?: string;
        data?: any;
    }

    interface SearchResponse {
        places: Place[];
    }

    interface AutocompleteResponse {
        results: AutocompleteResult[];
    }

    interface AutocompleteResult {
        displayLines: string[];
        coordinate: Coordinate;
    }

    interface Place {
        name: string;
        coordinate: Coordinate;
        formattedAddress: string;
        region: CoordinateRegion;
    }

    interface GeocoderResponse {
        results: GeocoderResult[];
    }

    interface GeocoderResult {
        name: string;
        coordinate: Coordinate;
        formattedAddress: string;
        locality: string;
        administrativeArea: string;
        postCode: string;
        country: string;
    }

    interface DirectionsRequest {
        origin: Coordinate | string;
        destination: Coordinate | string;
        transportType?: string;
    }

    interface DirectionsResponse {
        routes: Route[];
    }

    interface Route {
        name: string;
        distance: number;
        expectedTravelTime: number;
        path: Coordinate[];
        polyline: any;
    }

    const ColorSchemes: {
        Light: string;
        Dark: string;
    };

    const MapTypes: {
        Standard: string;
        Satellite: string;
        Hybrid: string;
        MutedStandard: string;
    };

    // Directions class with static Transport property
    interface DirectionsConstructor {
        new(): DirectionsInstance;
        Transport: {
            Automobile: string;
            Walking: string;
        };
    }

    interface DirectionsInstance {
        route(request: DirectionsRequest, callback: (error: Error | null, data: DirectionsResponse) => void): void;
    }

    const Directions: DirectionsConstructor;
    }
}

let mapkitLoaded = false;
let mapkitLoadPromise: Promise<void> | null = null;

export async function loadMapKit(): Promise<void> {
    if (mapkitLoaded) return;

    if (mapkitLoadPromise) return mapkitLoadPromise;

    mapkitLoadPromise = new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.mapkit) {
            mapkitLoaded = true;
            resolve();
            return;
        }

        // Load the MapKit JS script
        const script = document.createElement('script');
        script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';
        script.crossOrigin = 'anonymous';

        script.onload = () => {
            // Initialize MapKit with the token
            window.mapkit.init({
                authorizationCallback: (done) => {
                    const token = process.env.NEXT_PUBLIC_APPLE_MAPS_TOKEN;
                    if (token) {
                        done(token);
                    } else {
                        reject(new Error('Apple Maps token not found'));
                    }
                },
            });

            mapkitLoaded = true;
            resolve();
        };

        script.onerror = () => {
            reject(new Error('Failed to load Apple MapKit JS'));
        };

        document.head.appendChild(script);
    });

    return mapkitLoadPromise;
}

export function getMapKit(): typeof mapkit | null {
    return window.mapkit || null;
}

// Helper to create a coordinate
export function createCoordinate(lat: number, lng: number): mapkit.Coordinate {
    return new window.mapkit.Coordinate(lat, lng);
}

// Helper to create a region
export function createRegion(lat: number, lng: number, latSpan: number = 0.05, lngSpan: number = 0.05): mapkit.CoordinateRegion {
    return new window.mapkit.CoordinateRegion(
        createCoordinate(lat, lng),
        new window.mapkit.CoordinateSpan(latSpan, lngSpan)
    );
}

// Default center (San Francisco)
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

// Search for places
export async function searchPlaces(query: string, region?: mapkit.CoordinateRegion): Promise<mapkit.Place[]> {
    await loadMapKit();

    return new Promise((resolve, reject) => {
        const search = new window.mapkit.Search({ region });
        search.search(query, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.places);
            }
        });
    });
}

// Geocode an address
export async function geocodeAddress(address: string): Promise<mapkit.GeocoderResult | null> {
    await loadMapKit();

    return new Promise((resolve, reject) => {
        const geocoder = new window.mapkit.Geocoder();
        geocoder.lookup(address, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.results[0] || null);
            }
        });
    });
}

// Reverse geocode coordinates
export async function reverseGeocode(lat: number, lng: number): Promise<mapkit.GeocoderResult | null> {
    await loadMapKit();

    return new Promise((resolve, reject) => {
        const geocoder = new window.mapkit.Geocoder();
        geocoder.reverseLookup(createCoordinate(lat, lng), (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.results[0] || null);
            }
        });
    });
}

// Get directions between two points
export async function getDirections(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string,
    transportType: 'Automobile' | 'Walking' = 'Automobile'
): Promise<mapkit.Route[]> {
    await loadMapKit();

    return new Promise((resolve, reject) => {
        const directions = new window.mapkit.Directions();

        const request: mapkit.DirectionsRequest = {
            origin: typeof origin === 'string' ? origin : createCoordinate(origin.lat, origin.lng),
            destination: typeof destination === 'string' ? destination : createCoordinate(destination.lat, destination.lng),
            transportType: window.mapkit.Directions.Transport[transportType],
        };

        directions.route(request, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.routes);
            }
        });
    });
}
