import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { surahFromSlug } from '@/lib/quran-meta';
import QuranPageReader from './QuranPageReader';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

// Official Madinah Mushaf start page for every surah. Used to map a surah slug
// in the URL (/quran/Al-Baqarah) to the correct opening Mushaf page.
export const SURAH_START_PAGES: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208, 11: 221, 12: 235,
  13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312, 21: 322, 22: 332, 23: 342, 24: 350,
  25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404, 31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440,
  37: 446, 38: 453, 39: 458, 40: 467, 41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511,
  49: 515, 50: 518, 51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572,
  73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585, 81: 586, 82: 587, 83: 587, 84: 589,
  85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594, 91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597,
  97: 598, 98: 598, 99: 599, 100: 599, 101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602,
  109: 603, 110: 603, 111: 603, 112: 604, 113: 604, 114: 604,
};

const LAST_PAGE_KEY = 'atraa_quran_last_page_v2';

const getLastPage = (): number => {
  try {
    const raw = localStorage.getItem(LAST_PAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isFinite(n) && n >= 1 && n <= 604 ? n : 1;
  } catch {
    return 1;
  }
};

const setLastPage = (p: number) => {
  try { localStorage.setItem(LAST_PAGE_KEY, String(p)); } catch { /* ignore */ }
};

/**
 * Quran section — opens the QPC V2 page-by-page Madinah Mushaf reader directly,
 * inline (no surah picker). The reader self-verifies fonts and never displays
 * uncertain glyphs. Persists the last viewed page locally so users resume where
 * they left off.
 */
const QuranSection = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [surahs, setSurahs] = useState<Surah[] | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(false);

  // Resolve initial page: URL slug > stored last page > page 1
  const [initialPage] = useState(() => {
    if (params.slug) {
      const num = surahFromSlug(params.slug);
      if (num && SURAH_START_PAGES[num]) return SURAH_START_PAGES[num];
    }
    return getLastPage();
  });

  // Fetch surah metadata once (needed for the inline surah-name banner)
  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data?.data && Array.isArray(data.data)) {
          setSurahs(data.data as Surah[]);
        } else {
          setListError(true);
        }
      })
      .catch(() => !cancelled && setListError(true))
      .finally(() => !cancelled && setLoadingList(false));
    return () => { cancelled = true; };
  }, []);

  const surahsByNumber = useMemo(() => {
    if (!surahs) return new Map<number, Surah>();
    return new Map(surahs.map(s => [s.number, s]));
  }, [surahs]);

  const handlePageChange = (page: number) => {
    setLastPage(page);
    // Keep URL clean — don't push a new entry per page swipe
    if (params.slug) {
      const localePrefix = params.locale ? `/${params.locale}` : '';
      navigate(`${localePrefix}/quran`, { replace: true });
    }
  };

  if (loadingList) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
      </div>
    );
  }

  if (listError || !surahs) {
    return (
      <div className="text-center py-16 px-6">
        <p className="text-[12px] text-foreground/80 font-medium mb-1">
          تعذّر تحميل بيانات السور
        </p>
        <p className="text-[11px] text-muted-foreground/60 font-light">
          تحقّق من اتصال الإنترنت وأعد المحاولة
        </p>
      </div>
    );
  }

  return (
    <QuranPageReader
      inline
      initialPage={initialPage}
      surahsByNumber={surahsByNumber}
      onPageChange={handlePageChange}
    />
  );
};

export default QuranSection;
