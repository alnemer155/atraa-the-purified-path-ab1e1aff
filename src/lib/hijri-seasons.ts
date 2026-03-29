// Hijri seasonal theme detection
// Uses Aladhan API Hijri date to determine special months

export type Season = 'muharram' | 'ramadan' | 'default';

export interface SeasonTheme {
  season: Season;
  colors: {
    primary: string;
    primaryForeground: string;
    primaryGlow: string;
    gradient: string;
  };
}

const SEASON_THEMES: Record<Season, SeasonTheme> = {
  muharram: {
    season: 'muharram',
    colors: {
      primary: '0 70% 17%',        // #560000 deep red
      primaryForeground: '0 0% 100%',
      primaryGlow: '0 60% 25%',
      gradient: 'linear-gradient(135deg, hsl(0 70% 17%), hsl(0 60% 25%))',
    },
  },
  ramadan: {
    season: 'ramadan',
    colors: {
      primary: '160 100% 14%',     // #004632 Saudi green
      primaryForeground: '0 0% 100%',
      primaryGlow: '160 80% 22%',
      gradient: 'linear-gradient(135deg, hsl(160 100% 14%), hsl(160 80% 22%))',
    },
  },
  default: {
    season: 'default',
    colors: {
      primary: '152 42% 22%',
      primaryForeground: '40 30% 97%',
      primaryGlow: '148 45% 30%',
      gradient: 'linear-gradient(135deg, hsl(152 42% 22%), hsl(148 45% 30%))',
    },
  },
};

// Check if current Hijri date falls in a special season
export function detectSeason(hijriMonth: number, hijriDay: number): Season {
  // Muharram: month 1, day 1-13
  if (hijriMonth === 1 && hijriDay >= 1 && hijriDay <= 13) return 'muharram';
  // Ramadan: month 9, day 1-28
  if (hijriMonth === 9 && hijriDay >= 1 && hijriDay <= 28) return 'ramadan';
  return 'default';
}

export function getSeasonTheme(season: Season): SeasonTheme {
  return SEASON_THEMES[season];
}

// Get appropriate logo based on season
export function getSeasonLogo(season: Season): string {
  switch (season) {
    case 'muharram': return 'muharram';
    case 'ramadan': return 'ramadan';
    default: return 'default';
  }
}
