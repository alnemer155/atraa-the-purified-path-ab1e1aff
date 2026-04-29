import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  LayoutGrid,
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
import { useQuranTheme } from '@/lib/quran-theme';
import AyahColorPicker from './AyahColorPicker';
import QuranQuickPanel from './QuranQuickPanel';
import TafsirSheet from './TafsirSheet';

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
  /** Opens the advanced recitation panel (reciter / range / repeat / speed). */
  onOpenRecitation?: () => void;
  /** Reports the surahs present on the currently-loaded page (used as range default). */
  onPageSurahsChange?: (surahs: SurahMeta[]) => void;
}

type Orientation = 'vertical' | 'horizontal';

const ORIENTATION_KEY = 'atraa_quran_orientation_v2';

const getStoredOrientation = (): Orientation => {
  try {
    const v = localStorage.getItem(ORIENTATION_KEY);
    // New default: horizontal (paper-mushaf feel) per user preference.
    return v === 'vertical' ? 'vertical' : 'horizontal';
  } catch { return 'horizontal'; }
};

/** Fixed Quran body font size (locked — no user resize per design). */
const FIXED_FONT_SIZE = 26;

/* ============================================================
 * Surah header — illuminated cartouche with KFGQPC-set surah name
 * ============================================================ */
const MadinahSurahHeader = ({ meta }: { meta: SurahMeta }) => {
  const cleanName = meta.name
    .replace(/^سُورَةُ\s*/, '')
    .replace(/^سورة\s*/, '');
  return (
    <div className="my-6 text-center select-none" aria-label={`سورة ${cleanName}`}>
      <div className="relative mx-auto max-w-[380px] h-[88px] flex items-center justify-center">
        <svg
          viewBox="0 0 380 88"
          className="absolute inset-0 w-full h-full text-gold"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="cartoucheFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.06" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <path
            d="M30 8 H350 Q372 8 372 30 V58 Q372 80 350 80 H30 Q8 80 8 58 V30 Q8 8 30 8 Z"
            fill="url(#cartoucheFill)"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeOpacity="0.7"
          />
          <path
            d="M36 14 H344 Q366 14 366 30 V58 Q366 74 344 74 H36 Q14 74 14 58 V30 Q14 14 36 14 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />
          <path
            d="M40 18 H340 Q362 18 362 30 V58 Q362 70 340 70 H40 Q18 70 18 58 V30 Q18 18 40 18 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            strokeOpacity="0.35"
          />
          {[28, 352].map((cx) => (
            <g key={cx} stroke="currentColor" fill="none" strokeWidth="0.5" opacity="0.75">
              <circle cx={cx} cy={44} r={6} />
              <circle cx={cx} cy={44} r={3.5} strokeOpacity="0.6" />
              <g opacity="0.85">
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * Math.PI) / 4;
                  const x2 = cx + Math.cos(angle) * 5.5;
                  const y2 = 44 + Math.sin(angle) * 5.5;
                  return <line key={i} x1={cx} y1={44} x2={x2} y2={y2} strokeWidth="0.3" />;
                })}
              </g>
              <circle cx={cx} cy={44} r={1} fill="currentColor" opacity="0.7" />
            </g>
          ))}
          <g stroke="currentColor" fill="none" strokeWidth="0.45" opacity="0.6">
            <path d="M40 44 q12 -8 24 0 q12 8 24 0" />
            <path d="M340 44 q-12 -8 -24 0 q-12 8 -24 0" />
          </g>
          <g stroke="currentColor" fill="none" strokeWidth="0.4" opacity="0.55">
            <path d="M178 8 q12 -6 24 0" />
            <path d="M178 80 q12 6 24 0" />
            <circle cx="190" cy="6" r="0.9" fill="currentColor" opacity="0.7" />
            <circle cx="190" cy="82" r="0.9" fill="currentColor" opacity="0.7" />
          </g>
        </svg>

        <div className="relative flex flex-col items-center" style={{ lineHeight: 1.05 }}>
          <p className="quran-uthmani text-[26px] text-foreground leading-none">{cleanName}</p>
          <p className="text-[7.5px] text-gold/80 font-light mt-2 tracking-[0.32em]">
            {meta.revelationType === 'Medinan' ? 'مَدَنِيَّة' : 'مَكِّيَّة'} · {toArabicNumerals(meta.numberOfAyahs)} آية
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Standalone Basmalah line shown above each surah (except Al-Fatiha and At-Tawbah).
 * Renders the full Uthmani text — NOT the ligature glyph (﷽) — so it matches
 * the printed Madinah Mushaf exactly. The basmalah is also stripped from the
 * first ayah of these surahs by `stripBasmalah` to avoid duplication.
 */
const BasmalahLine = () => (
  <p
    className="quran-uthmani text-center text-foreground/90 mb-4 mt-1 leading-loose"
    style={{ fontSize: '22px', wordSpacing: '0.05em' }}
  >
    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  </p>
);

/* ============================================================
 * Page content — flowing justified mushaf paragraph
 * ============================================================ */
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
      className={`mx-auto max-w-2xl px-5 py-6 ${isCentered ? 'min-h-[60vh] flex flex-col justify-center' : ''}`}
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

/* ============================================================
 * Reader root
 * ============================================================ */
const QuranPageReader = ({
  initialPage,
  surahsByNumber,
  onClose,
  onPageChange,
  inline = false,
  onPlayAyah,
  playingAyah,
  onOpenRecitation,
  onPageSurahsChange,
}: Props) => {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<PageData | null>(null);
  const [neighbourData, setNeighbourData] = useState<Map<number, PageData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>(getStoredOrientation);
  const [theme, setTheme] = useQuranTheme();
  const [colorMap, setColorMap] = useState<Record<string, AyahColor>>(() => getAllAyahColors());
  const [pickerAyah, setPickerAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [tafsirAyah, setTafsirAyah] = useState<{ surah: number; ayah: number } | null>(null);
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

  // Surahs that appear on the current page — passed up so PlaybackPanel can
  // default the recitation range to the first surah on this page.
  useEffect(() => {
    if (!data || !onPageSurahsChange) return;
    const seen = new Set<number>();
    const list: SurahMeta[] = [];
    for (const a of data.ayahs) {
      if (seen.has(a.surah.number)) continue;
      seen.add(a.surah.number);
      const meta = surahsByNumber.get(a.surah.number);
      if (meta) list.push(meta);
    }
    onPageSurahsChange(list);
  }, [data, surahsByNumber, onPageSurahsChange]);

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

  const jumpToSurah = (surahNum: number) => {
    const p = SURAH_START_PAGES[surahNum];
    if (p) setPage(p);
  };

  // Horizontal swipe rail — three-page window (prev/current/next), recentred on each page change.
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
    ? 'flex flex-col bg-background text-foreground'
    : 'fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden';

  const cleanCurrentName = currentSurahMeta
    ? currentSurahMeta.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '')
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={wrapperClass}
      dir="rtl"
      data-quran-theme={theme === 'default' ? undefined : theme}
    >
      {/* ============ Top bar — refined "mushaf rail" ============
        * Single line: index button · centered surah cartouche pill (surah · page · juz) · recitation/close. */}
      <div
        className={`${inline ? 'sticky top-[41px] z-30' : 'flex-shrink-0'} relative px-3 pt-2.5 pb-2 flex items-center gap-2 bg-background/90 backdrop-blur-2xl`}
      >
        {/* subtle gold underline instead of a hard border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-gold/25 to-transparent pointer-events-none" />

        <button
          onClick={() => setShowPanel(true)}
          className="w-9 h-9 rounded-full bg-secondary/30 border border-border/15 flex items-center justify-center active:scale-90 transition-transform shrink-0"
          aria-label="فهرس وأدوات"
        >
          <LayoutGrid className="w-[15px] h-[15px] text-foreground/70" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => setShowPanel(true)}
          className="flex-1 relative h-9 px-3 rounded-full bg-gradient-to-b from-secondary/25 to-secondary/10 border border-border/15 active:scale-[0.99] transition-all overflow-hidden"
          aria-label="معلومات الصفحة"
        >
          {/* tiny gold corner ornaments */}
          <span aria-hidden className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gold/55" />
          <span aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gold/55" />
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center gap-2.5 leading-none"
            >
              <span className="surah-name-display text-[13px] text-foreground truncate max-w-[42%]">
                {cleanCurrentName}
              </span>
              <span className="w-px h-3 bg-gold/30" />
              <span className="text-[10.5px] text-muted-foreground/80 font-light tabular-nums whitespace-nowrap">
                ﴿{toArabicNumerals(page)}﴾
              </span>
              {juzHizb && (
                <>
                  <span className="w-px h-3 bg-gold/30" />
                  <span className="text-[10px] text-muted-foreground/65 font-light tabular-nums whitespace-nowrap">
                    جـ{toArabicNumerals(juzHizb.juz)}
                  </span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </button>

        {onClose ? (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary/30 border border-border/15 flex items-center justify-center active:scale-90 shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-[15px] h-[15px] text-foreground/70" />
          </button>
        ) : (
          onOpenRecitation && (
            <button
              onClick={onOpenRecitation}
              className="relative w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 via-gold/15 to-primary/10 border border-gold/40 flex items-center justify-center active:scale-90 shrink-0"
              aria-label="التلاوة"
            >
              <span aria-hidden className="absolute inset-0 rounded-full ring-1 ring-gold/20 animate-pulse" />
              <Mic className="relative w-[15px] h-[15px] text-gold" strokeWidth={1.7} />
            </button>
          )
        )}
      </div>

      {/* ============ Body ============ */}
      <div ref={containerRef} className={inline ? '' : 'flex-1 overflow-y-auto'}>
        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
            <p className="text-[10px] text-muted-foreground/50 font-light">جارٍ تحميل الصفحة…</p>
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

      {/* ============ Footer ============
        * Minimal navigation: prev / progress (tap to open quick-panel) / next.
        * Progress fill doubles as the visual position indicator. */}
      <div
        className={`${inline ? 'sticky bottom-14 z-30' : 'flex-shrink-0'} relative bg-background/90 backdrop-blur-2xl px-3 pt-2 pb-2.5`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/25 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2.5">
          {/* Next page (RTL: visual right → next Arabic page) */}
          <button
            onClick={goNext}
            disabled={page >= 604}
            className="w-11 h-11 rounded-full bg-secondary/30 border border-border/15 flex items-center justify-center disabled:opacity-25 active:scale-90 transition-transform"
            aria-label="الصفحة التالية"
          >
            <ChevronLeft className="w-[15px] h-[15px] text-foreground/70" strokeWidth={1.7} />
          </button>

          <button
            onClick={() => setShowPanel(true)}
            className="flex-1 h-11 rounded-full bg-gradient-to-b from-secondary/25 to-secondary/10 border border-border/15 active:scale-[0.99] transition-all overflow-hidden relative"
            aria-label="فهرس وأدوات"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4">
              <span className="text-[10.5px] text-muted-foreground/80 font-light tabular-nums leading-none">
                {toArabicNumerals(page)} <span className="text-muted-foreground/40 mx-0.5">·</span> {toArabicNumerals(604)}
              </span>
              <div className="w-full h-[2px] rounded-full bg-border/25 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-gold/80 via-gold/60 to-primary/70"
                  initial={false}
                  animate={{ width: `${(page / 604) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                />
              </div>
            </div>
          </button>

          {/* Previous page (RTL: visual left → previous Arabic page) */}
          <button
            onClick={goPrev}
            disabled={page <= 1}
            className="w-11 h-11 rounded-full bg-secondary/30 border border-border/15 flex items-center justify-center disabled:opacity-25 active:scale-90 transition-transform"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="w-[15px] h-[15px] text-foreground/70" strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {/* ============ Quick-access panel (Surahs · Jump · Marks · Display) ============ */}
      <QuranQuickPanel
        open={showPanel}
        onClose={() => setShowPanel(false)}
        surahsByNumber={surahsByNumber}
        surahStartPages={SURAH_START_PAGES}
        currentPage={page}
        onJumpToPage={(p) => setPage(p)}
        onJumpToSurah={jumpToSurah}
        orientation={orientation}
        onOrientationChange={setOrientation}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* ============ Ayah color picker bottom-sheet ============ */}
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
          onTafsir={() => {
            const a = pickerAyah;
            setPickerAyah(null);
            setTafsirAyah(a);
          }}
          onClose={() => setPickerAyah(null)}
        />
      )}

      {/* ============ Tafsir bottom-sheet ============ */}
      {tafsirAyah && (
        <TafsirSheet
          open
          surah={tafsirAyah.surah}
          ayah={tafsirAyah.ayah}
          surahName={(() => {
            const m = surahsByNumber.get(tafsirAyah.surah);
            return m ? m.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '') : '';
          })()}
          onClose={() => setTafsirAyah(null)}
        />
      )}
    </motion.div>
  );
};

export default QuranPageReader;
