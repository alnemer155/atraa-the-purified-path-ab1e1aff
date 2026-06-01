// Global site maintenance state — read from public.site_settings.
// When `maintenance_active` is true, the whole app renders MaintenancePage
// with the admin-defined message and scheduled date/time.

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteMaintenance {
  active: boolean;
  message: string;
  until: string | null; // ISO timestamp or null
}

const DEFAULT: SiteMaintenance = {
  active: false,
  message: 'الموقع تحت الصيانة حالياً، نعتذر عن الإزعاج.',
  until: null,
};

export const useSiteMaintenance = (): { state: SiteMaintenance; loading: boolean } => {
  const [state, setState] = useState<SiteMaintenance>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('maintenance_active, maintenance_message, maintenance_until')
          .eq('id', 'global')
          .maybeSingle();
        if (cancelled) return;
        if (data) {
          setState({
            active: !!data.maintenance_active,
            message: data.maintenance_message || DEFAULT.message,
            until: data.maintenance_until ?? null,
          });
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();

    const channel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        const row = (payload.new ?? payload.old) as { maintenance_active?: boolean; maintenance_message?: string; maintenance_until?: string | null } | null;
        if (!row) return;
        setState({
          active: !!row.maintenance_active,
          message: row.maintenance_message || DEFAULT.message,
          until: row.maintenance_until ?? null,
        });
      })
      .subscribe();

    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, []);

  return { state, loading };
};
