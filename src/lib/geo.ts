// Geo utilities: accurate haversine distance and reverse-geocode-assisted city matching.

export interface CityLite {
  value: string;
  lat: number;
  lng: number;
  region: string;
}

export interface ReverseGeoResult {
  city?: string;
  country?: string;
  countryCode?: string;
  state?: string;
}

const EARTH_RADIUS_KM = 6371;

/** Accurate great-circle distance (km). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find nearest city by true great-circle distance. */
export function findNearestCity<T extends CityLite>(lat: number, lng: number, cities: T[]): { city: T; distanceKm: number } | null {
  if (!cities.length) return null;
  let best = cities[0];
  let bestDist = haversineKm(lat, lng, best.lat, best.lng);
  for (let i = 1; i < cities.length; i++) {
    const d = haversineKm(lat, lng, cities[i].lat, cities[i].lng);
    if (d < bestDist) { bestDist = d; best = cities[i]; }
  }
  return { city: best, distanceKm: bestDist };
}

/** Reverse geocode via Nominatim (free, no key). Returns best-effort city/country. */
export async function reverseGeocode(lat: number, lng: number, lang = 'ar'): Promise<ReverseGeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&accept-language=${lang}`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) return null;
    const data = await r.json();
    const a = data?.address || {};
    return {
      city: a.city || a.town || a.village || a.municipality || a.county || a.state_district,
      state: a.state,
      country: a.country,
      countryCode: (a.country_code || '').toUpperCase(),
    };
  } catch {
    return null;
  }
}

/**
 * High-accuracy GPS lookup. Returns coords; never times out silently.
 */
export function getAccurateLocation(timeoutMs = 12000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('GPS unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}
