// User data types and localStorage helpers

export interface UserData {
  name: string;
  title: 'سيد' | 'سيدة' | 'شيخ' | 'custom' | 'none';
  customTitle?: string;
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
    return `حياك الله يا ${title} ${user.name}`;
  }
  return `حياك الله يا ${user.name}`;
}
