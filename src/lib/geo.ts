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

/**
 * Best-accuracy GPS — collects samples for up to `windowMs` and returns the
 * single most accurate fix (lowest `accuracy` in metres). Falls back to a
 * one-shot reading if `watchPosition` is unavailable. This dramatically
 * improves first-fix quality on devices that warm-start their GNSS chip.
 *
 * `acceptAccuracyM` lets callers short-circuit early once accuracy is good
 * enough (e.g. ≤ 30 m), avoiding the full window when the fix is solid.
 */
export function getBestAccuracyLocation({
  windowMs = 6000,
  acceptAccuracyM = 25,
  fallbackTimeoutMs = 12000,
}: { windowMs?: number; acceptAccuracyM?: number; fallbackTimeoutMs?: number } = {}): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('GPS unsupported'));
      return;
    }

    let best: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let settled = false;

    const finish = (pos: GeolocationPosition | null, err?: Error) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) {
        try { navigator.geolocation.clearWatch(watchId); } catch { /* ignore */ }
      }
      if (pos) resolve(pos);
      else reject(err || new Error('GPS unavailable'));
    };

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (!best || pos.coords.accuracy < best.coords.accuracy) {
            best = pos;
          }
          if (best && best.coords.accuracy <= acceptAccuracyM) {
            finish(best);
          }
        },
        (err) => {
          // Only fail if we never got a sample.
          if (!best) finish(null, new Error(err.message));
        },
        { enableHighAccuracy: true, timeout: fallbackTimeoutMs, maximumAge: 0 }
      );
    } catch {
      // Browser blocked watchPosition — fall back to one-shot.
      navigator.geolocation.getCurrentPosition(
        (pos) => finish(pos),
        (err) => finish(null, new Error(err.message)),
        { enableHighAccuracy: true, timeout: fallbackTimeoutMs, maximumAge: 0 }
      );
      return;
    }

    // Window deadline — accept the best sample we collected.
    setTimeout(() => {
      if (best) finish(best);
      else finish(null, new Error('GPS window timed out'));
    }, windowMs);
  });
}

/* ---------------------------------------------------------------------------
 * GPS cache (v2.7.38) — keep last good fix in localStorage so the app can
 * show a sensible immediate value while a fresh, more accurate fix arrives.
 * Cache TTL: 30 minutes; only fixes with accuracy ≤ 100 m are persisted.
 * ------------------------------------------------------------------------- */
const GPS_CACHE_KEY = 'atraa_gps_cache_v1';
const GPS_CACHE_TTL_MS = 30 * 60 * 1000;

export interface CachedFix {
  lat: number;
  lng: number;
  accuracy: number;
  ts: number;
}

export function readCachedFix(): CachedFix | null {
  try {
    const raw = localStorage.getItem(GPS_CACHE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as CachedFix;
    if (!v || typeof v.lat !== 'number' || typeof v.lng !== 'number') return null;
    if (Date.now() - v.ts > GPS_CACHE_TTL_MS) return null;
    return v;
  } catch { return null; }
}

export function writeCachedFix(pos: GeolocationPosition): void {
  try {
    if (pos.coords.accuracy > 100) return;
    const v: CachedFix = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      ts: Date.now(),
    };
    localStorage.setItem(GPS_CACHE_KEY, JSON.stringify(v));
  } catch { /* ignore */ }
}

/**
 * Convenience wrapper: tries cache first (instant), then refines with a
 * fresh high-accuracy fix in the background. Caller receives both via
 * callbacks. Useful for screens that want to render immediately.
 */
export async function getLocationFastThenAccurate(
  onFast: (lat: number, lng: number, fromCache: boolean) => void,
  onAccurate?: (pos: GeolocationPosition) => void,
): Promise<void> {
  const cached = readCachedFix();
  if (cached) onFast(cached.lat, cached.lng, true);
  try {
    const pos = await getBestAccuracyLocation({ windowMs: 6000, acceptAccuracyM: 20 });
    writeCachedFix(pos);
    if (!cached) onFast(pos.coords.latitude, pos.coords.longitude, false);
    onAccurate?.(pos);
  } catch {
    /* keep cached value if available */
  }
}
