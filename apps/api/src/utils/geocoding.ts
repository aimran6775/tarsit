/**
 * Geocoding utility for converting addresses to coordinates
 * Uses free Nominatim (OpenStreetMap) API
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface GeocodingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

/**
 * Geocode an address using Nominatim (OpenStreetMap) API
 * This is free but has rate limits (1 request/second)
 * For production, consider using Google Maps Geocoding API
 */
export async function geocodeAddress(address: GeocodingAddress): Promise<GeocodingResult | null> {
  try {
    // Build address string
    const addressParts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.zipCode,
      address.country || 'USA',
    ].filter(Boolean);
    
    const addressString = addressParts.join(', ');
    const encodedAddress = encodeURIComponent(addressString);

    // Use Nominatim API (free, OSM data)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'Tarsit/1.0 (contact@tarsit.com)', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      console.warn('No geocoding results found for:', addressString);
      return null;
    }

    const result = results[0];
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Fallback geocoding using city/state to a rough location
 * This provides approximate coordinates when exact address fails
 */
export async function geocodeCityState(city: string, state: string): Promise<GeocodingResult | null> {
  try {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      {
        headers: {
          'User-Agent': 'Tarsit/1.0 (contact@tarsit.com)',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return null;
    }

    return {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    };
  } catch (error) {
    console.error('City/State geocoding error:', error);
    return null;
  }
}

/**
 * Default coordinates for major US cities (fallback)
 */
export const DEFAULT_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'san antonio': { lat: 29.4241, lng: -98.4936 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'san jose': { lat: 37.3382, lng: -121.8863 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'portland': { lat: 45.5152, lng: -122.6784 },
};

/**
 * Get default coordinates for a city (last resort fallback)
 */
export function getDefaultCityCoordinates(city: string): GeocodingResult | null {
  const normalizedCity = city.toLowerCase().trim();
  const coords = DEFAULT_CITY_COORDINATES[normalizedCity];
  
  if (coords) {
    return {
      latitude: coords.lat,
      longitude: coords.lng,
    };
  }
  
  // Ultimate fallback: center of USA
  return {
    latitude: 39.8283,
    longitude: -98.5795,
  };
}
