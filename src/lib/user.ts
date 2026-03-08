// User data types and localStorage helpers

export interface UserData {
  name: string;
  title: 'سيد' | 'سيدة' | 'شيخ' | 'custom' | 'none';
  customTitle?: string;
  email?: string;
  registered: boolean;
}

const USER_KEY = 'atraa_user';

export function getUser(): UserData | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUser(user: UserData): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getDisplayTitle(user: UserData): string {
  if (user.title === 'none') return '';
  if (user.title === 'custom') return user.customTitle || '';
  const titles: Record<string, string> = {
    'سيد': 'السيد',
    'سيدة': 'السيدة',
    'شيخ': 'الشيخ',
  };
  return titles[user.title] || '';
}

export function getGreeting(user: UserData): string {
  const title = getDisplayTitle(user);
  if (title) {
    return `حياك الله يا ${title} ${user.name} 👋🏻✨`;
  }
  return `حياك الله يا ${user.name} 👋🏻✨`;
}

// Last reading tracking
export interface LastReading {
  id: string;
  title: string;
  category: string;
  timestamp: number;
}

export function saveLastReading(reading: LastReading): void {
  localStorage.setItem('atraa_last_reading', JSON.stringify(reading));
}

export function getLastReading(): LastReading | null {
  const data = localStorage.getItem('atraa_last_reading');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Tasbih state tracking
export interface TasbihState {
  mode: 'zahra' | 'open';
  step: number;
  count: number;
  openCount: number;
  timestamp: number;
}

export function saveTasbihState(state: TasbihState): void {
  localStorage.setItem('atraa_tasbih_state', JSON.stringify(state));
}

export function getTasbihState(): TasbihState | null {
  const data = localStorage.getItem('atraa_tasbih_state');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Hijri date adjustment
export function getHijriAdjustment(): number {
  const val = localStorage.getItem('atraa_hijri_adjust');
  return val ? parseInt(val, 10) : 0;
}

export function setHijriAdjustment(val: number): void {
  localStorage.setItem('atraa_hijri_adjust', String(val));
}
