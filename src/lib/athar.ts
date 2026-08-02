/**
 * Athar (أثر) — quotes/sayings of the Prophet ﷺ and the Imams (a.s.).
 *
 * v2.12.47: Athar is merged into the main platform. The canonical route is
 * now the internal `/athar` page (`/athar/:id` for details). The legacy
 * subdomain still resolves for old shared links.
 */
import { supabase } from '@/integrations/supabase/client';

export interface AtharQuote {
  id: string;
  text: string;
  sayer: string;
  sayer_info: string | null;
  source: string | null;
  interpretation: string | null;
  sect: 'shia' | 'sunni' | 'both';
  created_at: string;
}

/** Legacy standalone host — kept only for backwards-compatible links. */
export const ATHAR_PUBLIC_BASE = 'https://athar.atraa.xyz';

/** Canonical in-app base path (v2.12.47). */
export const ATHAR_PATH = '/athar';

/** Absolute share URL for a quote on the main platform. */
export const atharShareUrl = (id: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://atraa.xyz';
  return `${origin}${ATHAR_PATH}/${id}`;
};

export const generateAtharId = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  const arr = new Uint32Array(7);
  if (typeof crypto !== 'undefined') crypto.getRandomValues(arr);
  for (let i = 0; i < 7; i++) {
    const v = arr[i] || Math.floor(Math.random() * 1e9);
    id += alphabet[v % alphabet.length];
  }
  return id;
};

/** Fetch latest quotes — no sect filter (visible to everyone). */
export const fetchAthar = async (limit = 6): Promise<AtharQuote[]> => {
  const { data } = await supabase
    .from('athar_quotes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as AtharQuote[]) ?? [];
};

/** @deprecated kept for compatibility — sect param is ignored. */
export const fetchAtharForMadhhab = async (
  _m: unknown,
  limit = 6,
): Promise<AtharQuote[]> => fetchAthar(limit);

export const fetchAtharById = async (id: string): Promise<AtharQuote | null> => {
  const { data } = await supabase
    .from('athar_quotes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as AtharQuote) ?? null;
};

/* ---------------- Saved quotes (local, per device) ---------------- */

const SAVED_KEY = 'atraa_athar_saved_v1';

export const getSavedAthar = (): string[] => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
};

export const isAtharSaved = (id: string): boolean => getSavedAthar().includes(id);

export const toggleAtharSaved = (id: string): boolean => {
  const list = getSavedAthar();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next.includes(id);
};
