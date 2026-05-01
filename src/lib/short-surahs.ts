// Surahs with ayah count between 7 and 20 (inclusive), per Hafs counting.
// Used for "short surah" khatma mode where the dedication is publicly listed
// regardless of visibility (so any reader can quickly join).
export const SHORT_SURAH_NUMBERS: number[] = [
  1, 49, 60, 61, 62, 63, 64, 65, 66, 73,
  82, 86, 87, 90, 91, 93, 94, 95, 96, 98,
  99, 100, 101, 102, 104, 107,
];

export const isShortSurah = (n: number | null | undefined): boolean =>
  typeof n === 'number' && SHORT_SURAH_NUMBERS.includes(n);
