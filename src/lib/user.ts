// User data — v11: local only (no auth, no profile beyond city/lang preferences)

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

export function getHijriAdjustment(): number {
  const val = localStorage.getItem('atraa_hijri_adjust');
  return val ? parseInt(val, 10) : 0;
}

export function setHijriAdjustment(val: number): void {
  localStorage.setItem('atraa_hijri_adjust', String(val));
}
