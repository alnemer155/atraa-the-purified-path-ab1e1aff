/**
 * Quran recitation engine — Abdulbasit Abdulsamad (Murattal, 192 kbps).
 *
 * Source: EveryAyah.com — the de-facto open Quran audio CDN used by Quran.com,
 * Tarteel, and most Mushaf apps. Files are addressable as
 *   https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/SSSAAA.mp3
 * where SSS = 3-digit surah and AAA = 3-digit ayah (e.g. 002001.mp3).
 * Every surah additionally has a bismillah file 001001.mp3 served at the
 * surah-1 path, so we just play the surah's own ayah list.
 *
 * Architecture (hybrid — safe on iOS Safari + Android Chrome):
 *   1. Instant playback streams from EveryAyah on first request.
 *   2. Played files are auto-cached in `caches.open('atraa-quran-audio-v1')`.
 *   3. The user can opt-in to download a full surah for offline use; we cap
 *      total cache at MAX_CACHE_BYTES and evict in LRU order.
 *
 * No bulk 450 MB download — that would be silently purged on iOS (~50 MB
 * per-origin Cache Storage quota). Per-surah download is the safe maximum.
 */

import { getReciter, getStoredReciterId } from './quran-reciters';

const CDN_HOST = 'https://everyayah.com/data';
const CACHE_NAME = 'atraa-quran-audio-v1';
/** Soft cap: ~120 MB. Far below the iOS quota; LRU-evicted when exceeded. */
const MAX_CACHE_BYTES = 120 * 1024 * 1024;

const LRU_KEY = 'atraa_quran_audio_lru_v1';
const VOLUME_KEY = 'atraa_quran_audio_volume_v1';

const pad3 = (n: number) => String(n).padStart(3, '0');

/**
 * Builds the CDN URL for an ayah using the currently selected reciter
 * (or an explicit override). Defaults to the user's stored choice so any
 * existing call sites (e.g. download manager, cache eviction) continue
 * working without changes.
 */
export const ayahAudioUrl = (
  surah: number,
  ayah: number,
  reciterId: string = getStoredReciterId(),
): string => {
  const reciter = getReciter(reciterId);
  return `${CDN_HOST}/${reciter.folder}/${pad3(surah)}${pad3(ayah)}.mp3`;
};

/* ============ LRU bookkeeping (size estimate per URL) ============ */

interface LruEntry { url: string; bytes: number; ts: number; }

const readLru = (): LruEntry[] => {
  try {
    const raw = localStorage.getItem(LRU_KEY);
    return raw ? (JSON.parse(raw) as LruEntry[]) : [];
  } catch { return []; }
};

const writeLru = (entries: LruEntry[]) => {
  try { localStorage.setItem(LRU_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
};

const touchLru = (url: string, bytes: number) => {
  const list = readLru().filter(e => e.url !== url);
  list.push({ url, bytes, ts: Date.now() });
  writeLru(list);
};

const totalCachedBytes = (): number => readLru().reduce((s, e) => s + e.bytes, 0);

/** Evict oldest entries until under MAX_CACHE_BYTES. */
async function enforceQuota(): Promise<void> {
  if (typeof caches === 'undefined') return;
  let list = readLru().sort((a, b) => a.ts - b.ts);
  let total = list.reduce((s, e) => s + e.bytes, 0);
  if (total <= MAX_CACHE_BYTES) return;
  const cache = await caches.open(CACHE_NAME);
  while (total > MAX_CACHE_BYTES && list.length) {
    const victim = list.shift()!;
    try { await cache.delete(victim.url); } catch { /* ignore */ }
    total -= victim.bytes;
  }
  writeLru(list);
}

/* ============ Playback fetch — cache-first, network-fallback ============ */

/**
 * Returns a playable Blob URL for an ayah, preferring the on-device cache.
 * Streams from CDN on cache miss and stores the response in the background.
 */
export async function getAyahAudioBlobUrl(surah: number, ayah: number): Promise<string> {
  const url = ayahAudioUrl(surah, ayah);

  // No Cache Storage (private mode / very old browsers): direct stream.
  if (typeof caches === 'undefined') return url;

  try {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(url);
    if (hit) {
      const blob = await hit.clone().blob();
      touchLru(url, blob.size);
      return URL.createObjectURL(blob);
    }
    // Network — stream + cache
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const cloned = resp.clone();
    const blob = await resp.blob();
    cache.put(url, cloned).then(() => {
      touchLru(url, blob.size);
      enforceQuota();
    }).catch(() => { /* quota exceeded — non-fatal */ });
    return URL.createObjectURL(blob);
  } catch {
    // Last resort: let the <audio> element try directly
    return url;
  }
}

/** Best-effort revocation of a blob URL produced by `getAyahAudioBlobUrl`. */
export function revokeAyahBlobUrl(blobUrl: string): void {
  if (blobUrl.startsWith('blob:')) {
    try { URL.revokeObjectURL(blobUrl); } catch { /* ignore */ }
  }
}

/* ============ Per-surah bulk download (opt-in) ============ */

export interface SurahDownloadProgress {
  surah: number;
  done: number;
  total: number;
  bytes: number;
  cancelled?: boolean;
}

/**
 * Downloads every ayah of `surah` (ayah count provided by caller) into the
 * cache. `onProgress` is invoked after each ayah. The returned function can
 * be called to abort.
 */
export function downloadSurah(
  surah: number,
  ayahCount: number,
  onProgress?: (p: SurahDownloadProgress) => void,
): { promise: Promise<SurahDownloadProgress>; cancel: () => void } {
  let cancelled = false;
  const promise = (async (): Promise<SurahDownloadProgress> => {
    const cache = typeof caches !== 'undefined' ? await caches.open(CACHE_NAME) : null;
    let bytes = 0;
    for (let a = 1; a <= ayahCount; a++) {
      if (cancelled) break;
      const url = ayahAudioUrl(surah, a);
      try {
        if (cache) {
          const existing = await cache.match(url);
          if (existing) {
            const b = await existing.clone().blob();
            bytes += b.size;
            touchLru(url, b.size);
          } else {
            const resp = await fetch(url, { mode: 'cors' });
            if (resp.ok) {
              const cloned = resp.clone();
              const b = await resp.blob();
              bytes += b.size;
              await cache.put(url, cloned);
              touchLru(url, b.size);
            }
          }
        }
      } catch { /* skip failures, continue */ }
      onProgress?.({ surah, done: a, total: ayahCount, bytes });
    }
    if (cache) await enforceQuota();
    return { surah, done: ayahCount, total: ayahCount, bytes, cancelled };
  })();
  return { promise, cancel: () => { cancelled = true; } };
}

/** Removes every cached ayah of `surah`. */
export async function deleteSurahFromCache(surah: number, ayahCount: number): Promise<void> {
  if (typeof caches === 'undefined') return;
  const cache = await caches.open(CACHE_NAME);
  let list = readLru();
  for (let a = 1; a <= ayahCount; a++) {
    const url = ayahAudioUrl(surah, a);
    try { await cache.delete(url); } catch { /* ignore */ }
    list = list.filter(e => e.url !== url);
  }
  writeLru(list);
}

/** Returns total bytes currently cached (for "storage used" UI). */
export function getTotalCachedBytes(): number {
  return totalCachedBytes();
}

/** Has every ayah of `surah` been cached? (Used to show "Downloaded" badge.) */
export function isSurahFullyCached(surah: number, ayahCount: number): boolean {
  const set = new Set(readLru().map(e => e.url));
  for (let a = 1; a <= ayahCount; a++) {
    if (!set.has(ayahAudioUrl(surah, a))) return false;
  }
  return true;
}

/* ============ Volume persistence ============ */

export const getStoredVolume = (): number => {
  try {
    const n = parseFloat(localStorage.getItem(VOLUME_KEY) || '0.85');
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : 0.85;
  } catch { return 0.85; }
};

export const setStoredVolume = (v: number): void => {
  try { localStorage.setItem(VOLUME_KEY, String(v)); } catch { /* ignore */ }
};
