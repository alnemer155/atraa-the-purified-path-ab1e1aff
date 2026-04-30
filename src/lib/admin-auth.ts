// Lightweight client-side admin gate. PIN is intentionally simple and
// scoped to the admin subdomain — the data behind it is non-sensitive
// (manually-curated supplications, ziyarat, adhkar, wallpapers).

const PIN = '5616';
const KEY = 'atraa.admin.pin.ok.v1';

export function isAdminHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'admin.atraa.xyz';
}

export function isAdminUnlocked(): boolean {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function unlockAdmin(pin: string): boolean {
  if (pin !== PIN) return false;
  try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
  return true;
}

export function lockAdmin() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
