// Lightweight runtime error logger — writes to public.error_logs so the
// developer admin panel can review crashes & unhandled rejections.
import { supabase } from '@/integrations/supabase/client';

let installed = false;
const inFlight = new Set<string>();

export function logError(message: string, opts: { stack?: string; level?: 'error' | 'warning'; context?: Record<string, unknown> } = {}) {
  const key = `${message}::${opts.stack?.slice(0, 200) ?? ''}`;
  if (inFlight.has(key)) return;
  inFlight.add(key);
  setTimeout(() => inFlight.delete(key), 4000);
  try {
    void supabase.from('error_logs').insert({
      message: String(message).slice(0, 4000),
      stack: opts.stack ? String(opts.stack).slice(0, 8000) : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      level: opts.level ?? 'error',
      context: opts.context ?? {},
    });
  } catch { /* never let logging crash the app */ }
}

export function installGlobalErrorLogging() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (e) => {
    if (!e?.message) return;
    logError(e.message, { stack: e.error?.stack, context: { type: 'window.error', filename: e.filename, lineno: e.lineno } });
  });
  window.addEventListener('unhandledrejection', (e) => {
    const reason = (e as any).reason;
    const msg = reason?.message ?? String(reason ?? 'unhandledrejection');
    logError(msg, { stack: reason?.stack, context: { type: 'unhandledrejection' } });
  });
}
