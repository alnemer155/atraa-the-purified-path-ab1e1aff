// Hidden sections — globally toggleable pages & home-page sections,
// managed from the developer admin panel (v2.10.60.20).
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HiddenSectionId =
  | 'home_prayer_times' | 'home_qibla' | 'home_athar' | 'home_khatma'
  | 'home_live' | 'home_wallpapers' | 'home_daily_picks'
  | 'page_library' | 'page_quran' | 'page_minbar' | 'page_athar'
  | 'page_khatma' | 'page_support' | 'page_tasbih';

interface HiddenSection {
  id: HiddenSectionId;
  label: string;
  hidden: boolean;
}

let cache: Record<string, boolean> | null = null;
let inflight: Promise<Record<string, boolean>> | null = null;

async function fetchAll(): Promise<Record<string, boolean>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase.from('hidden_sections').select('id, hidden');
    cache = {};
    (data ?? []).forEach((r: any) => { cache![r.id] = !!r.hidden; });
    inflight = null;
    return cache;
  })();
  return inflight;
}

export function invalidateHiddenSectionsCache() { cache = null; }

export function useHiddenSections() {
  const [map, setMap] = useState<Record<string, boolean>>(cache ?? {});
  const [loading, setLoading] = useState(!cache);
  useEffect(() => {
    let active = true;
    void fetchAll().then((m) => { if (active) { setMap({ ...m }); setLoading(false); } });
    return () => { active = false; };
  }, []);
  return { map, loading, isHidden: (id: HiddenSectionId) => !!map[id] };
}

export function useIsSectionHidden(id: HiddenSectionId): boolean {
  const { isHidden } = useHiddenSections();
  return isHidden(id);
}

export async function listHiddenSections(): Promise<HiddenSection[]> {
  const { data } = await supabase.from('hidden_sections').select('*').order('id');
  return (data as HiddenSection[]) ?? [];
}

export async function setSectionHidden(id: HiddenSectionId, hidden: boolean) {
  invalidateHiddenSectionsCache();
  await supabase.from('hidden_sections').update({ hidden, updated_at: new Date().toISOString() }).eq('id', id);
}
