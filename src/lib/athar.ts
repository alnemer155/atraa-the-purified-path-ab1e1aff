/**
 * Athar (أثر) — quotes/sayings of the Prophet ﷺ and the Imams (a.s.).
 * 7-character alphanumeric public IDs, hosted externally at
 * https://athar.atraa.xyz/{id} for sharing & rich detail pages.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Madhhab } from './madhhab';

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

export const ATHAR_PUBLIC_BASE = 'https://athar.atraa.xyz';

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

export const fetchAtharForMadhhab = async (m: Madhhab, limit = 6): Promise<AtharQuote[]> => {
  const sects = m === 'sunni' ? ['sunni', 'both'] : ['shia', 'both'];
  const { data } = await supabase
    .from('athar_quotes')
    .select('*')
    .in('sect', sects)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as AtharQuote[]) ?? [];
};

export const fetchAtharById = async (id: string): Promise<AtharQuote | null> => {
  const { data } = await supabase
    .from('athar_quotes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as AtharQuote) ?? null;
};
