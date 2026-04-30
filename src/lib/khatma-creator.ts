// Local registry of khatmas the current device created,
// and per-juz reader claims this device made.

const KEY = 'atraa.khatma.creators.v1';
const READER_KEY = 'atraa.khatma.readers.v1';

type Registry = Record<string, string>;
// readerKey: `${khatmaId}:${juz}` -> reader_token
type ReaderRegistry = Record<string, string>;

function read<T extends Record<string, string>>(key: string): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

function write(key: string, reg: Record<string, string>) {
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
  const reg = read<Registry>(KEY);
  reg[khatmaId] = token;
  write(KEY, reg);
}

export function getCreatorToken(khatmaId: string): string | null {
  return read<Registry>(KEY)[khatmaId] ?? null;
}

export function isCreator(khatmaId: string): boolean {
  return !!getCreatorToken(khatmaId);
}

export function forgetCreator(khatmaId: string) {
  const reg = read<Registry>(KEY);
  delete reg[khatmaId];
  write(KEY, reg);
}

// Reader claims (per-juz)
function readerKey(khatmaId: string, juz: number) {
  return `${khatmaId}:${juz}`;
}

export function rememberReader(khatmaId: string, juz: number, token: string) {
  const reg = read<ReaderRegistry>(READER_KEY);
  reg[readerKey(khatmaId, juz)] = token;
  write(READER_KEY, reg);
}

export function getReaderToken(khatmaId: string, juz: number): string | null {
  return read<ReaderRegistry>(READER_KEY)[readerKey(khatmaId, juz)] ?? null;
}

export function forgetReader(khatmaId: string, juz: number) {
  const reg = read<ReaderRegistry>(READER_KEY);
  delete reg[readerKey(khatmaId, juz)];
  write(READER_KEY, reg);
}

export function generateReaderToken(): string {
  return generateCreatorToken();
}

export const DURATION_OPTIONS = [
  { hours: 12, label: '١٢ ساعة' },
  { hours: 24, label: '٢٤ ساعة' },
  { hours: 36, label: 'يوم ونصف' },
] as const;

export const KHATMA_BASE_URL = 'https://khatma.atraa.xyz';

export function khatmaShareUrl(slug: string): string {
  return `${KHATMA_BASE_URL}/${slug}`;
}
