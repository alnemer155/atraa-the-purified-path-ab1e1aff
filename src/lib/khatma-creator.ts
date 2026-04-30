// Local registry of khatmas the current device created.
// Maps khatma id -> creator_token (random secret).

const KEY = 'atraa.khatma.creators.v1';

type Registry = Record<string, string>;

function read(): Registry {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Registry) : {};
  } catch {
    return {};
  }
}

function write(reg: Registry) {
  try {
    localStorage.setItem(KEY, JSON.stringify(reg));
  } catch { /* ignore */ }
}

export function generateCreatorToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function rememberCreator(khatmaId: string, token: string) {
  const reg = read();
  reg[khatmaId] = token;
  write(reg);
}

export function getCreatorToken(khatmaId: string): string | null {
  return read()[khatmaId] ?? null;
}

export function isCreator(khatmaId: string): boolean {
  return !!getCreatorToken(khatmaId);
}

export function forgetCreator(khatmaId: string) {
  const reg = read();
  delete reg[khatmaId];
  write(reg);
}

export const DURATION_OPTIONS = [
  { hours: 12, label: '١٢ ساعة' },
  { hours: 24, label: '٢٤ ساعة' },
  { hours: 36, label: 'يوم ونصف' },
] as const;
