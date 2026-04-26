import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Settings2,
  RectangleHorizontal,
  RectangleVertical,
  Search,
  Mic,
} from 'lucide-react';
import {
  fetchPageText,
  toArabicNumerals,
  stripBasmalah,
  type PageData,
  type PageAyah,
} from '@/lib/quran-page';
import {
  getJuzForAyah,
  getHizbForAyah,
  stripArabicDiacritics,
} from '@/lib/quran-meta';
import { SURAH_START_PAGES } from './QuranSection';
import {
  getAyahColor,
  setAyahColor,
  clearAyahColor,
  getAllAyahColors,
  AYAH_COLOR_TOKENS,
  type AyahColor,
} from '@/lib/quran-bookmarks';
import AyahColorPicker from './AyahColorPicker';

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

interface Props {
  initialPage: number;
  surahsByNumber: Map<number, SurahMeta>;
  onClose?: () => void;
  onPageChange?: (page: number) => void;
  inline?: boolean;
  /** Called when user taps the "تلاوة" button on an ayah — starts the audio bar. */
  onPlayAyah?: (surah: number, ayah: number) => void;
  /** Currently-playing ayah, used to highlight it visually. */
  playingAyah?: { surah: number; ayah: number } | null;
}

type Orientation = 'vertical' | 'horizontal';

const ORIENTATION_KEY = 'atraa_quran_orientation_v1';

const getStoredOrientation = (): Orientation => {
  try {
    const v = localStorage.getItem(ORIENTATION_KEY);
    return v === 'horizontal' ? 'horizontal' : 'vertical';
  } catch { return 'vertical'; }
};

/** Fixed Quran body font size (locked — no user resize per design). */
const FIXED_FONT_SIZE = 26;

/**
 * Refined Madinah Mushaf surah header — minimal, calligraphic cartouche.
 * Smaller and more elegant than the previous oversized variant. Uses
 * the dedicated `surah-name-display` typeface for the surah name.
 */
const MadinahSurahHeader = ({ meta }: { meta: SurahMeta }) => {
  const cleanName = meta.name
    .replace(/^سُورَةُ\s*/, '')
    .replace(/^سورة\s*/, '');
  return (
    <div className="my-5 text-center select-none">
      <div className="relative mx-auto max-w-[360px] h-[64px] flex items-center justify-center">
        <svg
          viewBox="0 0 360 64"
          className="absolute inset-0 w-full h-full text-gold"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Single elegant outer frame */}
          <rect x="2" y="2" width="356" height="60" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
          <rect x="6" y="6" width="348" height="52" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.32" />
          {/* Soft corner flourishes */}
          <g stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.55">
            <path d="M10 18 q0 -8 8 -8" />
            <path d="M350 10 q8 0 8 8" />
            <path d="M10 46 q0 8 8 8" />
            <path d="M350 54 q8 0 8 -8" />
          </g>
          {/* Side rosettes */}
          <g stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6">
            <circle cx="24" cy="32" r="3.2" />
            <circle cx="336" cy="32" r="3.2" />
          </g>
          <g fill="currentColor" opacity="0.5">
            <circle cx="24" cy="32" r="0.7" />
            <circle cx="336" cy="32" r="0.7" />
          </g>
          {/* Connecting hairlines */}
          <g stroke="currentColor" strokeWidth="0.35" opacity="0.4">
            <path d="M30 32 H58" />
            <path d="M302 32 H330" />
          </g>
        </svg>

        <div className="relative flex flex-col items-center" style={{ lineHeight: 1.05 }}>
          <p className="surah-name-display text-[18px] text-foreground tracking-wide">
            {cleanName}
          </p>
          <p className="text-[7.5px] text-gold/80 font-light mt-1.5 tracking-[0.3em]">
            {meta.revelationType === 'Medinan' ? 'مَدَنِيَّة' : 'مَكِّيَّة'} · {toArabicNumerals(meta.numberOfAyahs)} آية
          </p>
        </div>
      </div>
    </div>
  );
};

/** Basmalah line drawn under each surah header (except At-Tawbah / Al-Fatihah). */
const BasmalahLine = () => (
  <p className="quran-uthmani text-center text-[20px] text-foreground/85 mb-3 mt-1">
    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  </p>
);

/**
 * Renders the page text — flowing justified paragraph with KFGQPC font,
 * with end-of-ayah Arabic numeral medallions between verses.
 */
const PageContent = ({
  data,
  isCentered,
  colorMap,
  onAyahTap,
  playingAyah,
}: {
  data: PageData;
  isCentered: boolean;
  colorMap: Record<string, AyahColor>;
  onAyahTap: (surah: number, ayah: number) => void;
  playingAyah?: { surah: number; ayah: number } | null;
}) => {
  // Group ayahs by surah so we can render a header before each surah's first ayah on the page.
  const blocks = useMemo(() => {
    const result: { surah: PageAyah['surah']; ayahs: PageAyah[]; isStart: boolean }[] = [];
    for (const a of data.ayahs) {
      const last = result[result.length - 1];
      const isStart = a.numberInSurah === 1;
      if (!last || last.surah.number !== a.surah.number) {
        result.push({ surah: a.surah, ayahs: [a], isStart });
      } else {
        last.ayahs.push(a);
      }
    }
    return result;
  }, [data]);

  return (
    <div
      className={`mx-auto max-w-2xl px-5 py-7 ${isCentered ? 'min-h-[60vh] flex flex-col justify-center' : ''}`}
      dir="rtl"
    >
      {blocks.map((block, bi) => (
        <div key={`${block.surah.number}-${bi}`}>
          {block.isStart && <MadinahSurahHeader meta={block.surah} />}
          {block.isStart && block.surah.number !== 9 && block.surah.number !== 1 && <BasmalahLine />}

          <p
            className="quran-uthmani text-foreground"
            style={{
              fontSize: `${FIXED_FONT_SIZE}px`,
              textAlign: 'justify',
              textAlignLast: 'center',
              lineHeight: 2.4,
              wordSpacing: '0.05em',
            }}
          >
            {block.ayahs.map((a, i) => {
              const text =
                a.numberInSurah === 1 && a.surah.number !== 1 && a.surah.number !== 9
                  ? stripBasmalah(a.text)
                  : a.text;
              const colorKey = `${a.surah.number}:${a.numberInSurah}`;
              const color = colorMap[colorKey];
              const isPlaying =
                playingAyah?.surah === a.surah.number && playingAyah?.ayah === a.numberInSurah;
              const tokens = color ? AYAH_COLOR_TOKENS[color] : null;
              const medallionStyle: React.CSSProperties = tokens
                ? {
                    background: `hsl(${tokens.bg})`,
                    color: `hsl(${tokens.text})`,
                    borderColor: `hsl(${tokens.ring})`,
                    boxShadow: `inset 0 0 0 2px hsl(var(--background)), 0 0 0 1px hsl(${tokens.ring} / 0.6)`,
                  }
                : {};
              return (
                <span key={a.number}>
                  {text}
                  <button
                    type="button"
                    onClick={() => onAyahTap(a.surah.number, a.numberInSurah)}
                    className={`ayah-number-medallion mx-1 inline-flex items-center justify-center align-middle cursor-pointer transition-transform active:scale-90 ${
                      isPlaying ? 'ring-2 ring-primary/70 ring-offset-1 ring-offset-background' : ''
                    }`}
                    style={medallionStyle}
                    aria-label={`الآية ${a.numberInSurah}`}
                  >
                    {toArabicNumerals(a.numberInSurah)}
                  </button>
                  {i < block.ayahs.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </p>
        </div>
      ))}
    </div>
  );
};

/**
 * Madinah Mushaf page-by-page reader using the official KFGQPC Uthmanic
 * Script font and Tanzil-verified Uthmani text (alquran.cloud).
 */
const QuranPageReader = ({ initialPage, surahsByNumber, onClose, onPageChange, inline = false, onPlayAyah, playingAyah }: Props) => {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<PageData | null>(null);
  const [neighbourData, setNeighbourData] = useState<Map<number, PageData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>(getStoredOrientation);
  const [jumpValue, setJumpValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [colorMap, setColorMap] = useState<Record<string, AyahColor>>(() => getAllAyahColors());
  const [pickerAyah, setPickerAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to in-tab color-mark changes (custom event from quran-bookmarks).
  useEffect(() => {
    const refresh = () => setColorMap(getAllAyahColors());
    window.addEventListener('atraa:ayah-marks-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('atraa:ayah-marks-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(ORIENTATION_KEY, orientation); } catch { /* ignore */ }
  }, [orientation]);

  // Preload neighbour pages
  useEffect(() => {
    const preload = async (p: number) => {
      try {
        const d = await fetchPageText(p);
        setNeighbourData(prev => {
          const next = new Map(prev);
          next.set(p, d);
          return next;
        });
      } catch { /* silent */ }
    };
    if (page > 1) preload(page - 1);
    if (page < 604) preload(page + 1);
  }, [page]);

  // Load current page
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    (async () => {
      try {
        const pageData = await fetchPageText(page);
        if (cancelled) return;
        setData(pageData);
        onPageChange?.(page);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (inline) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      containerRef.current?.scrollTo({ top: 0 });
    }
  }, [page, inline]);

  const currentSurahNumber = useMemo(() => {
    if (!data || !data.ayahs.length) return null;
    return data.ayahs[0].surah.number;
  }, [data]);
  const currentSurahMeta = currentSurahNumber ? surahsByNumber.get(currentSurahNumber) : undefined;

  // Juz / Hizb of the FIRST ayah on the current page
  const juzHizb = useMemo(() => {
    if (!data || !data.ayahs.length) return null;
    const first = data.ayahs[0];
    return {
      juz: getJuzForAyah(first.surah.number, first.numberInSurah),
      hizb: getHizbForAyah(first.surah.number, first.numberInSurah),
    };
  }, [data]);

  const isCentered = page <= 2;

  const goPrev = () => page > 1 && setPage(p => p - 1);
  const goNext = () => page < 604 && setPage(p => p + 1);

  const retry = () => {
    setError(null);
    setLoading(true);
    setData(null);
    setPage(p => p);
  };

  const handleJump = () => {
    const n = parseInt(jumpValue, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 604) {
      setPage(n);
      setShowSettings(false);
      setJumpValue('');
    }
  };

  // Surah search results (diacritic-insensitive Arabic + English)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [] as SurahMeta[];
    const normQ = stripArabicDiacritics(q).toLowerCase();
    const arr: SurahMeta[] = [];
    surahsByNumber.forEach(s => {
      const ar = stripArabicDiacritics(s.name).toLowerCase();
      const en = s.englishName.toLowerCase();
      if (ar.includes(normQ) || en.includes(normQ) || String(s.number) === q) {
        arr.push(s);
      }
    });
    return arr.slice(0, 8);
  }, [searchQuery, surahsByNumber]);

  const jumpToSurah = (surahNum: number) => {
    const p = SURAH_START_PAGES[surahNum];
    if (p) {
      setPage(p);
      setShowSettings(false);
      setSearchQuery('');
    }
  };

  // Horizontal rail
  const horizontalRailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (orientation !== 'horizontal' || !horizontalRailRef.current) return;
    const el = horizontalRailRef.current;
    el.scrollTo({ left: el.clientWidth, behavior: 'auto' });
  }, [orientation, page]);

  const onHorizontalScroll = () => {
    const el = horizontalRailRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const idx = Math.round(el.scrollLeft / w);
    if (idx === 0 && page > 1) setPage(p => p - 1);
    else if (idx === 2 && page < 604) setPage(p => p + 1);
  };

  const wrapperClass = inline
    ? 'flex flex-col bg-background'
    : 'fixed inset-0 z-50 bg-background flex flex-col overflow-hidden';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={wrapperClass}
      dir="rtl"
    >
      {/* Top bar — orientation · juz/hizb · settings */}
      <div className={`${inline ? 'sticky top-[41px] z-30' : 'flex-shrink-0'} px-4 py-2.5 flex items-center justify-between border-b border-border/10 bg-background/85 backdrop-blur-2xl`}>
        <button
          onClick={() => setOrientation(o => (o === 'vertical' ? 'horizontal' : 'vertical'))}
          className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95 transition-transform"
          aria-label={orientation === 'vertical' ? 'عرض أفقي' : 'عرض عمودي'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={orientation}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {orientation === 'vertical' ? (
                <RectangleHorizontal className="w-4 h-4 text-foreground/70" strokeWidth={1.6} />
              ) : (
                <RectangleVertical className="w-4 h-4 text-foreground/70" strokeWidth={1.6} />
              )}
            </motion.span>
          </AnimatePresence>
        </button>

        <div className="text-center pointer-events-none">
          <p className="text-[11px] text-foreground/85 font-medium tracking-wide">
            مُصْحَفُ المَدِينَةِ النَبَوِيَّة
          </p>
          {juzHizb ? (
            <p className="text-[8.5px] text-muted-foreground/70 font-light mt-0.5 tracking-wider tabular-nums">
              الجُزْء {toArabicNumerals(juzHizb.juz)} · الحِزْب {toArabicNumerals(juzHizb.hizb)}
            </p>
          ) : (
            <p className="text-[8px] text-muted-foreground/55 font-light mt-0.5 tracking-[0.15em]">
              بِرِوَايَةِ حَفْصٍ عَنْ عَاصِم
            </p>
          )}
        </div>

        {onClose ? (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4 text-foreground/70" />
          </button>
        ) : (
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
            aria-label="إعدادات القراءة"
          >
            <Settings2 className="w-4 h-4 text-foreground/70" strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* Settings overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
            onClick={() => { setShowSettings(false); setSearchQuery(''); }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="w-full max-w-sm bg-card rounded-3xl p-5 border border-border/20 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] text-foreground font-medium">إعدادات القراءة</p>
                <button
                  onClick={() => { setShowSettings(false); setSearchQuery(''); }}
                  className="w-7 h-7 rounded-full bg-secondary/40 flex items-center justify-center active:scale-95"
                  aria-label="إغلاق"
                >
                  <X className="w-3.5 h-3.5 text-foreground/60" />
                </button>
              </div>

              {/* Search by surah name */}
              <div className="mb-4">
                <p className="text-[11px] text-muted-foreground/70 font-light mb-2">بحث عن سورة</p>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.6} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="اكتب اسم السورة…"
                    className="w-full h-10 pr-9 pl-3 rounded-2xl bg-secondary/40 border border-border/20 text-[12px] text-foreground outline-none focus:border-primary/40"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-44 overflow-y-auto rounded-2xl bg-secondary/30 border border-border/15 hide-scrollbar">
                    {searchResults.map(s => (
                      <button
                        key={s.number}
                        onClick={() => jumpToSurah(s.number)}
                        className="w-full px-3 py-2 flex items-center justify-between gap-2 active:bg-secondary/60 transition-colors border-b border-border/10 last:border-0"
                      >
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                          {toArabicNumerals(s.number)}
                        </span>
                        <span className="surah-name-display text-[13px] text-foreground flex-1 text-right">
                          {s.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Jump to page */}
              <div className="mb-4">
                <p className="text-[11px] text-muted-foreground/70 font-light mb-2">انتقال إلى صفحة (١ – ٦٠٤)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={jumpValue}
                    onChange={e => setJumpValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJump()}
                    placeholder={String(page)}
                    className="flex-1 h-10 rounded-2xl bg-secondary/40 border border-border/20 text-center text-[14px] text-foreground tabular-nums outline-none focus:border-primary/40"
                  />
                  <button
                    onClick={handleJump}
                    disabled={!jumpValue}
                    className="px-4 h-10 rounded-2xl bg-primary text-primary-foreground text-[12px] active:scale-95 disabled:opacity-40"
                  >
                    انتقال
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div>
                <p className="text-[11px] text-muted-foreground/70 font-light mb-2">اتجاه العرض</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrientation('vertical')}
                    className={`h-10 rounded-2xl text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-colors ${orientation === 'vertical' ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/70'}`}
                  >
                    <RectangleVertical className="w-3.5 h-3.5" strokeWidth={1.6} />
                    <span>عمودي</span>
                  </button>
                  <button
                    onClick={() => setOrientation('horizontal')}
                    className={`h-10 rounded-2xl text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-colors ${orientation === 'horizontal' ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/70'}`}
                  >
                    <RectangleHorizontal className="w-3.5 h-3.5" strokeWidth={1.6} />
                    <span>أفقي</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div ref={containerRef} className={inline ? '' : 'flex-1 overflow-y-auto'}>
        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
            <p className="text-[10px] text-muted-foreground/50 font-light">
              جارٍ تحميل الصفحة…
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-6">
            <AlertTriangle className="w-6 h-6 text-foreground/40 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[12px] text-foreground/80 font-medium leading-relaxed mb-1">
              تعذّر تحميل الصفحة
            </p>
            <p className="text-[11px] text-muted-foreground/65 font-light leading-relaxed mb-4">
              تحقّق من اتصال الإنترنت وأعد المحاولة.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={retry}
                className="px-4 py-2 rounded-full bg-primary/90 text-primary-foreground text-[11px] active:scale-95"
              >
                إعادة المحاولة
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-secondary/40 text-[11px] text-foreground active:scale-95"
                >
                  إغلاق
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && data && orientation === 'vertical' && (
          <PageContent
            data={data}
            isCentered={isCentered}
            colorMap={colorMap}
            onAyahTap={(s, ay) => setPickerAyah({ surah: s, ayah: ay })}
            playingAyah={playingAyah}
          />
        )}

        {!loading && !error && data && orientation === 'horizontal' && (
          <div
            ref={horizontalRailRef}
            onScroll={onHorizontalScroll}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
            dir="rtl"
          >
            {[page - 1, page, page + 1].map((p, idx) => {
              const pageData = p === page ? data : neighbourData.get(p);
              return (
                <div
                  key={`${p}-${idx}`}
                  className="flex-shrink-0 w-full snap-center"
                  style={{ minHeight: '60vh' }}
                >
                  {p < 1 || p > 604 ? (
                    <div className="flex items-center justify-center py-24">
                      <p className="text-[11px] text-muted-foreground/50 font-light">— نهاية المصحف —</p>
                    </div>
                  ) : pageData ? (
                    <PageContent
                      data={pageData}
                      isCentered={p <= 2}
                      colorMap={colorMap}
                      onAyahTap={(s, ay) => setPickerAyah({ surah: s, ayah: ay })}
                      playingAyah={playingAyah}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-24">
                      <Loader2 className="w-4 h-4 text-muted-foreground/40 animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animated footer */}
      <div className={`${inline ? 'sticky bottom-14 z-30' : 'flex-shrink-0'} border-t border-border/10 bg-background/85 backdrop-blur-2xl px-3 py-2`}>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goNext}
            disabled={page >= 604}
            className="w-10 h-10 rounded-2xl bg-secondary/40 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
            aria-label="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4 text-foreground/70" strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex-1 h-10 rounded-2xl bg-secondary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all overflow-hidden relative"
            aria-label="إعدادات القراءة"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center gap-3 px-3"
              >
                <span className="surah-name-display text-[13px] text-foreground/85 truncate max-w-[55%]">
                  {currentSurahMeta
                    ? currentSurahMeta.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '')
                    : '—'}
                </span>
                <span className="w-px h-4 bg-border/50" />
                <span className="text-[11px] text-muted-foreground/70 font-light tabular-nums whitespace-nowrap">
                  ص {toArabicNumerals(page)} / {toArabicNumerals(604)}
                </span>
              </motion.div>
            </AnimatePresence>
          </button>

          <button
            onClick={goPrev}
            disabled={page <= 1}
            className="w-10 h-10 rounded-2xl bg-secondary/40 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4 text-foreground/70" strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-1.5 h-[2px] bg-secondary/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold/70 to-primary/80 rounded-full"
            initial={false}
            animate={{ width: `${(page / 604) * 100}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          />
        </div>
      </div>

      {/* Ayah color picker bottom-sheet */}
      {pickerAyah && (
        <AyahColorPicker
          open
          surah={pickerAyah.surah}
          ayah={pickerAyah.ayah}
          surahName={(() => {
            const m = surahsByNumber.get(pickerAyah.surah);
            return m ? m.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '') : '';
          })()}
          currentColor={getAyahColor(pickerAyah.surah, pickerAyah.ayah)}
          onPick={(c) => {
            setAyahColor(pickerAyah.surah, pickerAyah.ayah, c);
            setPickerAyah(null);
          }}
          onClear={() => {
            clearAyahColor(pickerAyah.surah, pickerAyah.ayah);
            setPickerAyah(null);
          }}
          onPlay={() => {
            onPlayAyah?.(pickerAyah.surah, pickerAyah.ayah);
            setPickerAyah(null);
          }}
          onClose={() => setPickerAyah(null)}
        />
      )}
    </motion.div>
  );
};

export default QuranPageReader;
