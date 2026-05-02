// Lightweight client-side admin gate. Credentials are intentionally simple
// and scoped to the admin subdomain — the data behind it is non-sensitive
// (manually-curated supplications, ziyarat, adhkar, wallpapers, qasaid).
//
// Two equivalent secrets are accepted:
//   - PIN (numeric, Arabic or Western digits): "5616"
//   - Text: "Alnemer515"

const PIN = '5616';
const TEXT = 'Alnemer515';
const KEY = 'atraa.admin.pin.ok.v1';

// Map Arabic-Indic / Eastern-Arabic digits to Western digits for comparison.
function normalizeDigits(input: string): string {
  return input.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
              .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

export function isAdminHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'admin.atraa.xyz';
}

export function isAdminUnlocked(): boolean {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function unlockAdmin(secret: string): boolean {
  const trimmed = (secret ?? '').trim();
  const numericNormalized = normalizeDigits(trimmed);
  const ok = numericNormalized === PIN || trimmed === TEXT;
  if (!ok) return false;
  try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
  return true;
}

export function lockAdmin() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
