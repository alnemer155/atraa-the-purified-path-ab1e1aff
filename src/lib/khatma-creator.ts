// Local registry of khatmas the current device created.
// Maps khatma id -> creator_token (random secret).

const KEY = 'atraa.khatma.creators.v1';
const JUZ_KEY = 'atraa.khatma.juz.v1';

type Registry = Record<string, string>;

function read(key: string): Registry {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Registry) : {};
  } catch {
    return {};
  }
}

function write(key: string, reg: Registry) {
  try {
    localStorage.setItem(key, JSON.stringify(reg));
  } catch { /* ignore */ }
}

export function generateCreatorToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function rememberCreator(khatmaId: string, token: string) {
  const reg = read(KEY);
  reg[khatmaId] = token;
  write(KEY, reg);
}

export function getCreatorToken(khatmaId: string): string | null {
  return read(KEY)[khatmaId] ?? null;
}

export function isCreator(khatmaId: string): boolean {
  return !!getCreatorToken(khatmaId);
}

export function forgetCreator(khatmaId: string) {
  const reg = read(KEY);
  delete reg[khatmaId];
  write(KEY, reg);
}

// Reader-side token used to claim/release a juz. One token per browser.
export function getReaderToken(): string {
  try {
    const existing = localStorage.getItem('atraa.khatma.reader.token');
    if (existing) return existing;
    const fresh = generateCreatorToken();
    localStorage.setItem('atraa.khatma.reader.token', fresh);
    return fresh;
  } catch {
    return generateCreatorToken();
  }
}

// Track which juz this device claimed on which khatma — for instant UI state.
export function rememberJuzClaim(khatmaId: string, juz: number) {
  const reg = read(JUZ_KEY);
  const list = reg[khatmaId] ? reg[khatmaId].split(',').filter(Boolean) : [];
  if (!list.includes(String(juz))) list.push(String(juz));
  reg[khatmaId] = list.join(',');
  write(JUZ_KEY, reg);
}

export function forgetJuzClaim(khatmaId: string, juz: number) {
  const reg = read(JUZ_KEY);
  const list = reg[khatmaId] ? reg[khatmaId].split(',').filter(Boolean) : [];
  reg[khatmaId] = list.filter(j => j !== String(juz)).join(',');
  write(JUZ_KEY, reg);
}

export function getMyJuzClaims(khatmaId: string): number[] {
  const reg = read(JUZ_KEY);
  if (!reg[khatmaId]) return [];
  return reg[khatmaId].split(',').filter(Boolean).map(Number);
}

export const DURATION_OPTIONS = [
  { hours: 12, label: '١٢ ساعة' },
  { hours: 24, label: '٢٤ ساعة' },
  { hours: 36, label: 'يوم ونصف' },
] as const;

// Public share URL — uses dedicated khatma subdomain when configured.
const KHATMA_HOST = 'https://khatma.atraa.xyz';

export function khatmaShareUrl(slug: string): string {
  return `${KHATMA_HOST}/${slug}`;
}

export function isOnKhatmaSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'khatma.atraa.xyz';
}
