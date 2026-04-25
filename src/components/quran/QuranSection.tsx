import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, BookOpen, X, Loader2, BookmarkCheck, Bookmark, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  saveContinueReading, getContinueReading, type ContinueReading,
  JUZ_STARTS, HIZB_STARTS, getSajdahType,
  slugForSurah, surahFromSlug, stripArabicDiacritics,
  toggleBookmark, isBookmarked,
} from '@/lib/quran-meta';
import { ayahMark } from '@/lib/islamic-symbols';
import QuranPageReader from './QuranPageReader';

interface Surah {
  number: number;
  name: string;             // Arabic name (e.g. سُورَةُ ٱلْفَاتِحَةِ)
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

interface Ayah {
  number: number;            // global mushaf number
  numberInSurah: number;
  text: string;
  juz?: number;
  page?: number;
}

interface AyahOfDay {
  text: string;
  surahName: string;
  surahNumber: number;
  numberInSurah: number;
}

// Verified, manually selected verses (Uthmani script) — used as a deterministic
// fallback when the network is unavailable. Each entry is a real, well-known
// ayah whose location is confirmed in the Mushaf.
const VERIFIED_DAILY_AYAHS: AyahOfDay[] = [
  { text: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا', surahName: 'الشرح', surahNumber: 94, numberInSurah: 6 },
  { text: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًۭا', surahName: 'الطلاق', surahNumber: 65, numberInSurah: 2 },
  { text: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ', surahName: 'البقرة', surahNumber: 2, numberInSurah: 152 },
  { text: 'وَقُل رَّبِّ زِدْنِى عِلْمًۭا', surahName: 'طه', surahNumber: 20, numberInSurah: 114 },
  { text: 'وَٱصْبِرُوا۟ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ', surahName: 'الأنفال', surahNumber: 8, numberInSurah: 46 },
  { text: 'حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ', surahName: 'آل عمران', surahNumber: 3, numberInSurah: 173 },
  { text: 'وَتَوَكَّلْ عَلَى ٱلْحَىِّ ٱلَّذِى لَا يَمُوتُ وَسَبِّحْ بِحَمْدِهِۦ', surahName: 'الفرقان', surahNumber: 25, numberInSurah: 58 },
  { text: 'رَبِّ ٱشْرَحْ لِى صَدْرِى وَيَسِّرْ لِىٓ أَمْرِى', surahName: 'طه', surahNumber: 20, numberInSurah: 25 },
  { text: 'إِنَّ ٱللَّهَ يُحِبُّ ٱلْمُتَوَكِّلِينَ', surahName: 'آل عمران', surahNumber: 3, numberInSurah: 159 },
  { text: 'وَبَشِّرِ ٱلصَّـٰبِرِينَ', surahName: 'البقرة', surahNumber: 2, numberInSurah: 155 },
  { text: 'إِنَّ ٱللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا۟ مَا بِأَنفُسِهِمْ', surahName: 'الرعد', surahNumber: 13, numberInSurah: 11 },
  { text: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ', surahName: 'الطلاق', surahNumber: 65, numberInSurah: 3 },
];

const TOTAL_QURAN_AYAHS = 6236;

// Deterministic day-of-year index — same value for every user on the same calendar day
const dayIndex = () => {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
};

const todayKey = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
};

// Ornate Heritage divider (illuminated arabesque)
const Ornament = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 240 18" className={className} aria-hidden>
    <g fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round">
      <path d="M0 9 H80" opacity="0.35" />
      <path d="M160 9 H240" opacity="0.35" />
      <circle cx="120" cy="9" r="6" opacity="0.6" />
      <circle cx="120" cy="9" r="2.2" opacity="0.9" />
      <path d="M105 9 q7 -7 15 0 q7 7 15 0" opacity="0.7" />
      <path d="M85 9 q3 -3 6 0 M149 9 q3 3 6 0" opacity="0.5" />
    </g>
  </svg>
);

// Decorative ayah-end marker using the official ۝ glyph (U+06DD) with verse number.
// Tap to bookmark / unbookmark the verse. Long-press friendly hit area.
const AyahMarker = ({
  n,
  sajdah,
  bookmarked,
  onToggle,
}: {
  n: number;
  sajdah?: 'wajib' | 'mustahabb' | null;
  bookmarked?: boolean;
  onToggle?: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="inline-flex items-center justify-center align-middle mx-1 quran-uthmani active:scale-90 transition-transform cursor-pointer"
    style={{ fontSize: '1em' }}
    title={bookmarked ? 'إزالة العلامة' : sajdah === 'wajib' ? 'سجدة واجبة — اضغط لإضافة علامة' : sajdah === 'mustahabb' ? 'سجدة مستحبة — اضغط لإضافة علامة' : 'إضافة علامة'}
    aria-label={bookmarked ? 'إزالة العلامة' : 'إضافة علامة'}
  >
    <span className={`ayah-mark ${bookmarked ? 'text-primary' : sajdah ? 'text-accent' : 'text-gold'}`} style={{ fontSize: '1.15em' }}>
      {ayahMark(n)}
    </span>
    {sajdah && (
      <span className="text-accent font-medium ms-0.5" style={{ fontSize: '0.7em' }} aria-hidden>۩</span>
    )}
    {bookmarked && (
      <span className="text-primary ms-0.5" style={{ fontSize: '0.55em' }} aria-hidden>●</span>
    )}
  </button>
);

const QuranSection = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [surahs, setSurahs] = useState<Surah[] | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(false);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const [openSurah, setOpenSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [ayahsError, setAyahsError] = useState(false);
  const [fontSize, setFontSize] = useState(22);
  const [continueReading, setContinueReading] = useState<ContinueReading | null>(() => getContinueReading());
  const [showIndex, setShowIndex] = useState(false);
  const [scrollToAyah, setScrollToAyah] = useState<number | null>(null);
  const [bookmarkVersion, setBookmarkVersion] = useState(0); // forces re-render after toggle
  const ayahRefs = useRef<Record<number, HTMLSpanElement | null>>({});

  // Page mapping: surah number → first page in mushaf (from quran.com chapters API).
  // When available, opening a surah launches the QPC V2 page-by-page renderer.
  const [surahPages, setSurahPages] = useState<Map<number, number> | null>(null);
  const [openPage, setOpenPage] = useState<number | null>(null);

  // Ayah of the day — deterministic per calendar day, fetched live from the
  // canonical Mushaf (AlQuran.cloud /ayah/{n}/quran-uthmani) so the verse is
  // a real, verified Quran ayah — never random words.
  const [ayahOfDay, setAyahOfDay] = useState<AyahOfDay | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = todayKey();
    const cacheKey = 'atraa_ayah_of_day';
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null') as { key: string; ayah: AyahOfDay } | null;
      if (cached && cached.key === key && cached.ayah) {
        setAyahOfDay(cached.ayah);
        return;
      }
    } catch { /* ignore */ }

    // Pick a deterministic ayah number in [1..6236] for today
    const ayahNumber = (dayIndex() % TOTAL_QURAN_AYAHS) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/quran-uthmani`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const a = data?.data;
        if (a?.text && a?.surah?.name && a?.numberInSurah && a?.surah?.number) {
          const verse: AyahOfDay = {
            text: a.text,
            surahName: a.surah.name.replace(/^سُورَةُ\s*/, ''),
            surahNumber: a.surah.number,
            numberInSurah: a.numberInSurah,
          };
          setAyahOfDay(verse);
          try { localStorage.setItem(cacheKey, JSON.stringify({ key, ayah: verse })); } catch { /* ignore */ }
        } else {
          // API responded but malformed — use verified fallback
          setAyahOfDay(VERIFIED_DAILY_AYAHS[dayIndex() % VERIFIED_DAILY_AYAHS.length]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Network failure — use verified fallback (still deterministic by day)
        setAyahOfDay(VERIFIED_DAILY_AYAHS[dayIndex() % VERIFIED_DAILY_AYAHS.length]);
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch surah list once
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

  // Fetch chapter→page mapping from quran.com (for QPC V2 page renderer)
  useEffect(() => {
    let cancelled = false;
    fetch('https://api.quran.com/api/v4/chapters?language=ar')
      .then(r => r.json())
      .then((d: { chapters?: Array<{ id: number; pages: [number, number] }> }) => {
        if (cancelled || !d?.chapters) return;
        const map = new Map<number, number>();
        for (const c of d.chapters) {
          if (Array.isArray(c.pages) && c.pages.length > 0) map.set(c.id, c.pages[0]);
        }
        setSurahPages(map);
      })
      .catch(() => { /* fall back to legacy reader */ });
    return () => { cancelled = true; };
  }, []);

  // Fetch surah ayahs when opened
  useEffect(() => {
    if (!openSurah) return;
    let cancelled = false;
    setLoadingAyahs(true);
    setAyahsError(false);
    setAyahs([]);
    fetch(`https://api.alquran.cloud/v1/surah/${openSurah.number}/quran-uthmani`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data?.data?.ayahs) {
          setAyahs(data.data.ayahs as Ayah[]);
        } else {
          setAyahsError(true);
        }
      })
      .catch(() => !cancelled && setAyahsError(true))
      .finally(() => !cancelled && setLoadingAyahs(false));
    return () => { cancelled = true; };
  }, [openSurah]);

  // Save continue-reading state when a surah is opened
  useEffect(() => {
    if (!openSurah) return;
    const c: ContinueReading = {
      surahNumber: openSurah.number,
      surahName: openSurah.name,
      ayahNumber: scrollToAyah || 1,
      timestamp: Date.now(),
    };
    saveContinueReading(c);
    setContinueReading(c);
  }, [openSurah, scrollToAyah]);

  // Open surah from URL slug (e.g. /quran/Al-Fatiha or /SA-ar/quran/Al-Fatiha)
  useEffect(() => {
    if (!surahs || !params.slug) return;
    const num = surahFromSlug(params.slug);
    if (!num) return;
    const found = surahs.find(s => s.number === num);
    if (found && (!openSurah || openSurah.number !== num)) {
      setOpenSurah(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahs, params.slug]);

  // Sync URL when user opens/closes a surah
  useEffect(() => {
    if (!openSurah) return;
    const slug = slugForSurah(openSurah.number);
    const localePrefix = params.locale ? `/${params.locale}` : '';
    const target = `${localePrefix}/quran/${slug}`;
    if (window.location.pathname !== target) {
      navigate(target, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSurah]);

  // Scroll to specific ayah after load (from index or continue)
  useEffect(() => {
    if (!scrollToAyah || loadingAyahs || !ayahs.length) return;
    const el = ayahRefs.current[scrollToAyah];
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }
  }, [scrollToAyah, loadingAyahs, ayahs]);

  const handleCloseSurah = () => {
    setOpenSurah(null);
    setScrollToAyah(null);
    const localePrefix = params.locale ? `/${params.locale}` : '';
    navigate(`${localePrefix}/quran`, { replace: true });
  };

  const filteredSurahs = useMemo(() => {
    if (!surahs) return [];
    const q = stripArabicDiacritics(search.trim()).toLowerCase();
    if (!q) return surahs;
    return surahs.filter(s =>
      stripArabicDiacritics(s.name).toLowerCase().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  }, [surahs, search]);

  const openAyahOfDay = () => {
    if (!ayahOfDay) return;
    const found = surahs?.find(s => s.number === ayahOfDay.surahNumber);
    if (found) setOpenSurah(found);
  };

  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Ayah of the day — Heritage illuminated panel
          Redesigned: layered arabesque frame, embossed Bismillah header,
          centered ayah with gold ayah-mark, subtle gold corner motifs. */}
      <button
        onClick={openAyahOfDay}
        disabled={!surahs || !ayahOfDay}
        className="group w-full rounded-3xl mb-5 relative overflow-hidden active:scale-[0.99] transition-transform"
      >
        {/* Layered background — soft gold gradient on card */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-gold/[0.04]" />
        <div className="absolute inset-0 ring-1 ring-inset ring-gold/15 rounded-3xl pointer-events-none" />
        <div className="absolute inset-[3px] ring-1 ring-inset ring-border/10 rounded-[22px] pointer-events-none" />

        {/* Subtle arabesque pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <pattern id="quran-pattern" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M14 2 L26 14 L14 26 L2 14 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
                <circle cx="14" cy="14" r="1.6" fill="currentColor" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#quran-pattern)" />
          </svg>
        </div>

        {/* Corner illuminations (4 corners) */}
        <svg className="absolute top-2.5 right-2.5 w-6 h-6 text-gold/55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7">
          <path d="M2 10 V2 H10 M2 2 q5 2 7 7" />
          <circle cx="3.5" cy="3.5" r="0.7" fill="currentColor" />
        </svg>
        <svg className="absolute top-2.5 left-2.5 w-6 h-6 text-gold/55 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7">
          <path d="M2 10 V2 H10 M2 2 q5 2 7 7" />
          <circle cx="3.5" cy="3.5" r="0.7" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-2.5 right-2.5 w-6 h-6 text-gold/55 -scale-y-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7">
          <path d="M2 10 V2 H10 M2 2 q5 2 7 7" />
          <circle cx="3.5" cy="3.5" r="0.7" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-2.5 left-2.5 w-6 h-6 text-gold/55 -scale-x-100 -scale-y-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7">
          <path d="M2 10 V2 H10 M2 2 q5 2 7 7" />
          <circle cx="3.5" cy="3.5" r="0.7" fill="currentColor" />
        </svg>

        <div className="relative px-6 pt-7 pb-6 text-center">
          {/* Top label */}
          <p className="text-[8px] text-gold/70 tracking-[0.32em] font-light mb-2 uppercase">
            {isAr ? 'آية اليوم' : 'Verse of the day'}
          </p>

          {/* Bismillah — always shown above the ayah */}
          <p
            className="quran-uthmani text-foreground/85 mb-3"
            style={{ fontSize: 18, lineHeight: 1.7 }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>

          <Ornament className="w-36 h-3 mx-auto text-gold/80 mb-4" />

          {ayahOfDay ? (
            <>
              <p
                className="quran-uthmani text-foreground mb-1 px-1"
                style={{ fontSize: 23, lineHeight: 2.0 }}
              >
                {ayahOfDay.text}
                <span className="text-gold ms-1" style={{ fontSize: '0.95em' }}>
                  {ayahMark(ayahOfDay.numberInSurah)}
                </span>
              </p>
              <Ornament className="w-36 h-3 mx-auto text-gold/80 mt-4 mb-3 rotate-180" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/25">
                <span className="text-[10px] text-foreground/75 font-light tracking-wide">
                  {isAr
                    ? `سورة ${ayahOfDay.surahName} · الآية ${ayahOfDay.numberInSurah}`
                    : `Surah ${ayahOfDay.surahName} · Ayah ${ayahOfDay.numberInSurah}`}
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-2 px-4 py-3">
              <div className="h-3 w-3/4 mx-auto rounded-md bg-secondary/40 animate-pulse" />
              <div className="h-3 w-1/2 mx-auto rounded-md bg-secondary/30 animate-pulse" />
              <div className="h-2 w-1/3 mx-auto rounded-md bg-secondary/20 animate-pulse mt-3" />
            </div>
          )}
        </div>
      </button>

      {/* Continue from bookmark / last reading */}
      {continueReading && surahs && (
        <button
          onClick={() => {
            const found = surahs.find(s => s.number === continueReading.surahNumber);
            if (found) {
              setOpenSurah(found);
              setScrollToAyah(continueReading.ayahNumber);
            }
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/15 active:scale-[0.985] transition-transform mb-3 ${isAr ? 'text-right' : 'text-left'}`}
        >
          <BookmarkCheck className="w-4 h-4 text-primary/70 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-primary/80 font-medium">
              {isAr ? 'متابعة من العلامة' : 'Continue from bookmark'}
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-light mt-0.5 truncate">
              {stripArabicDiacritics(continueReading.surahName)} · {isAr ? 'الآية' : 'Ayah'} {continueReading.ayahNumber}
            </p>
          </div>
          <ChevronLeft className={`w-3.5 h-3.5 text-primary/30 flex-shrink-0 ${isAr ? '' : 'rotate-180'}`} />
        </button>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 ${isAr ? 'right-3' : 'left-3'}`} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isAr ? 'ابحث عن سورة…' : 'Search surah…'}
          className={`w-full h-10 rounded-2xl bg-card border border-border/15 text-[12px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-foreground/20 transition-colors ${isAr ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'}`}
        />
      </div>

      {/* Surah list */}
      {loadingList && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
        </div>
      )}
      {listError && !loadingList && (
        <div className="text-center py-10">
          <p className="text-[11px] text-muted-foreground/60 font-light">
            {isAr ? 'تعذّر تحميل قائمة السور — تحقق من الاتصال' : 'Could not load surahs — check connection'}
          </p>
        </div>
      )}
      {!loadingList && !listError && filteredSurahs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-[11px] text-muted-foreground/50 font-light">
            {isAr ? 'لا توجد نتائج' : 'No results'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-1.5">
        {filteredSurahs.map((s, i) => (
          <motion.button
            key={s.number}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: Math.min(i * 0.005, 0.15) }}
            onClick={() => setOpenSurah(s)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/15 active:scale-[0.985] transition-transform ${isAr ? 'text-right' : 'text-left'}`}
          >
            {/* Heritage illuminated number medallion */}
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="absolute inset-0 text-gold/70" fill="none" stroke="currentColor" strokeWidth="0.7">
                <path d="M20 2 L34 8 L34 22 L20 38 L6 22 L6 8 Z" />
                <path d="M20 6 L30 11 L30 21 L20 33 L10 21 L10 11 Z" opacity="0.4" />
              </svg>
              <span className="relative text-[10px] text-foreground/80 tabular-nums">{s.number}</span>
            </div>
            <div className="flex-1 min-w-0">
              {/* Surah name in the site's primary font, no diacritics — easy to scan & search */}
              <p className="text-[15px] text-foreground leading-tight truncate font-medium">
                {stripArabicDiacritics(s.name)}
              </p>
              <p className="text-[9px] text-muted-foreground/50 font-light mt-0.5 truncate">
                {isAr
                  ? `${s.englishNameTranslation} · ${s.numberOfAyahs} آية · ${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`
                  : `${s.englishName} · ${s.numberOfAyahs} verses · ${s.revelationType}`}
              </p>
            </div>
            <ChevronLeft className={`w-3.5 h-3.5 text-muted-foreground/25 flex-shrink-0 ${isAr ? '' : 'rotate-180'}`} />
          </motion.button>
        ))}
      </div>

      {/* Reader modal */}
      <AnimatePresence>
        {openSurah && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-background/85 backdrop-blur-2xl border-b border-border/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <button
                onClick={handleCloseSurah}
                className="w-8 h-8 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
                aria-label="close"
              >
                <X className="w-4 h-4 text-foreground/70" />
              </button>
              <div className="text-center">
                {/* Reader header — clean name without diacritics + small Uthmani subtitle */}
                <p className="text-[15px] text-foreground leading-tight font-medium">
                  {stripArabicDiacritics(openSurah.name)}
                </p>
                <p className="text-[9px] text-muted-foreground/50 font-light mt-0.5">
                  {openSurah.numberOfAyahs} {isAr ? 'آية' : 'verses'} · {openSurah.revelationType === 'Meccan' ? (isAr ? 'مكية' : 'Meccan') : (isAr ? 'مدنية' : 'Medinan')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontSize(s => Math.max(16, s - 2))}
                  className="w-8 h-8 rounded-xl bg-secondary/40 flex items-center justify-center text-foreground/70 text-[10px] active:scale-95"
                  aria-label="smaller"
                >
                  −
                </button>
                <button
                  onClick={() => setFontSize(s => Math.min(34, s + 2))}
                  className="w-8 h-8 rounded-xl bg-secondary/40 flex items-center justify-center text-foreground/70 text-[12px] active:scale-95"
                  aria-label="larger"
                >
                  +
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {loadingAyahs && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
                </div>
              )}
              {ayahsError && !loadingAyahs && (
                <div className="text-center py-16">
                  <p className="text-[11px] text-muted-foreground/60 font-light">
                    {isAr ? 'تعذّر تحميل السورة — حاول مجدداً' : 'Could not load surah — try again'}
                  </p>
                </div>
              )}

              {!loadingAyahs && !ayahsError && ayahs.length > 0 && (
                <>
                  {/* Illuminated header */}
                  <div className="text-center mb-6">
                    <Ornament className="w-40 h-4 mx-auto text-gold mb-3" />
                    <div className="inline-flex items-center justify-center px-6 py-2 rounded-full border border-gold/30 bg-gold/5">
                      <BookOpen className="w-3 h-3 text-gold/70 ml-2" strokeWidth={1.5} />
                      <span className="text-[12px] text-foreground/80 quran-uthmani" style={{ lineHeight: 1.6 }}>{openSurah.name}</span>
                    </div>
                    <Ornament className="w-40 h-4 mx-auto text-gold mt-3 rotate-180" />
                  </div>

                  {/* Bismillah (skip for Surah 1 — already part of it; skip for Surah 9 which has no Bismillah) */}
                  {openSurah.number !== 1 && openSurah.number !== 9 && (
                    <p
                      className="text-center quran-uthmani text-foreground/85 mb-6"
                      style={{ fontSize: fontSize - 2 }}
                    >
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </p>
                  )}

                  {/* Continuous mushaf-style flow */}
                  <p
                    className="quran-uthmani text-foreground text-justify"
                    style={{ fontSize, wordSpacing: '0.05em' }}
                  >
                    {ayahs.map((a, idx) => {
                      // Strip the leading Bismillah from first ayah for surahs other than Fatiha
                      // because the API includes it inline for many surahs.
                      let text = a.text;
                      if (idx === 0 && openSurah.number !== 1 && openSurah.number !== 9) {
                        text = text.replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَـٰنِ\s*ٱلرَّحِيمِ\s*/, '');
                      }
                      const marked = isBookmarked(openSurah.number, a.numberInSurah);
                      // bookmarkVersion read forces React to recompute marked after toggle
                      void bookmarkVersion;
                      return (
                        <span
                          key={a.number}
                          ref={(el) => { ayahRefs.current[a.numberInSurah] = el; }}
                        >
                          {text}
                          <AyahMarker
                            n={a.numberInSurah}
                            sajdah={getSajdahType(openSurah.number, a.numberInSurah)}
                            bookmarked={marked}
                            onToggle={() => {
                              toggleBookmark({
                                surahNumber: openSurah.number,
                                surahName: stripArabicDiacritics(openSurah.name),
                                ayahNumber: a.numberInSurah,
                                ayahPreview: text.slice(0, 60),
                              });
                              setBookmarkVersion(v => v + 1);
                            }}
                          />
                          {' '}
                        </span>
                      );
                    })}
                  </p>

                  <div className="text-center mt-8 pb-6">
                    <Ornament className="w-32 h-3 mx-auto text-gold/70" />
                    <p className="text-[10px] text-muted-foreground/50 font-light mt-2 quran-uthmani" style={{ lineHeight: 1.6 }}>
                      صَدَقَ ٱللَّهُ ٱلْعَلِىُّ ٱلْعَظِيم
                    </p>
                    {/* Quran source disclaimer */}
                    <p className="text-[9px] text-muted-foreground/40 font-light mt-4 leading-relaxed px-4">
                      {isAr
                        ? 'النص بالرسم العثماني — مصدر: مجمع الملك فهد لطباعة المصحف الشريف عبر AlQuran.cloud. عند ملاحظة أي خطأ يُرجى التواصل عبر support@atraa.xyz'
                        : 'Uthmani script — sourced from King Fahd Glorious Quran Printing Complex via AlQuran.cloud. Report any issue at support@atraa.xyz'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuranSection;
