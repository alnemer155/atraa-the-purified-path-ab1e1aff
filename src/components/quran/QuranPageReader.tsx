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
} from 'lucide-react';
import {
  fetchPageData,
  loadPageFont,
  groupByLine,
  pageFontFamily,
  parseVerseKey,
  uniqueFontPagesFor,
  type QpcPageData,
  type QpcWord,
} from '@/lib/qpc-v2';

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
}

type Orientation = 'vertical' | 'horizontal';

const ORIENTATION_KEY = 'atraa_quran_orientation_v1';
const FONT_SIZE_KEY = 'atraa_quran_font_size_v1';

const getStoredOrientation = (): Orientation => {
  try {
    const v = localStorage.getItem(ORIENTATION_KEY);
    return v === 'horizontal' ? 'horizontal' : 'vertical';
  } catch { return 'vertical'; }
};

const getStoredFontSize = (): number => {
  try {
    const n = parseInt(localStorage.getItem(FONT_SIZE_KEY) || '26', 10);
    return Number.isFinite(n) && n >= 18 && n <= 38 ? n : 26;
  } catch { return 26; }
};

/**
 * Render the actual page content (lines + surah banners).
 * Extracted so it can be used both in vertical (current page only) and
 * horizontal (snap-scrolling between pages) modes.
 */
const PageContent = ({
  data,
  surahsByNumber,
  isCentered,
  fontSize,
}: {
  data: QpcPageData;
  surahsByNumber: Map<number, SurahMeta>;
  isCentered: boolean;
  fontSize: number;
}) => {
  const lines = useMemo(() => {
    const grouped = groupByLine(data.words);
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [data]);

  const surahStartsOnPage = useMemo(() => {
    const map = new Map<number, number>();
    for (const w of data.words) {
      if (w.verse_key && w.verse_key.endsWith(':1')) {
        const parsed = parseVerseKey(w.verse_key);
        if (parsed && !map.has(w.line_number)) {
          map.set(w.line_number, parsed.surah);
        }
      }
    }
    return map;
  }, [data]);

  return (
    <div
      className={`mx-auto max-w-2xl px-6 py-8 ${isCentered ? 'min-h-[70vh] flex flex-col justify-center' : ''}`}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: 2.0,
        direction: 'rtl',
      }}
    >
      {lines.map(([lineNum, words]) => {
        const surahHeader = surahStartsOnPage.get(lineNum);
        const surahMeta = surahHeader ? surahsByNumber.get(surahHeader) : undefined;
        return (
          <div key={lineNum}>
            {surahMeta && <MadinahSurahHeader meta={surahMeta} />}
            <p
              className="quran-page-line"
              style={{
                textAlign: isCentered ? 'center' : 'justify',
                textAlignLast: isCentered ? 'center' : 'justify',
                direction: 'rtl',
                whiteSpace: 'nowrap',
              }}
            >
              {words.map((w: QpcWord, i: number) => (
                <span
                  key={`${w.verse_key}-${w.position}-${i}`}
                  style={{ fontFamily: `'${pageFontFamily(w.v2_page)}'` }}
                >
                  {w.code_v2}
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Authentic Madinah Mushaf surah header — illuminated cartouche with refined
 * arabesques, double frame and gold ornament. Mirrors the band printed above
 * each surah opening in the King Fahd Madinah Mushaf.
 */
const MadinahSurahHeader = ({ meta }: { meta: SurahMeta }) => (
  <div className="my-6 text-center select-none">
    <div className="relative mx-auto max-w-[460px] h-[88px] flex items-center justify-center">
      <svg
        viewBox="0 0 460 88"
        className="absolute inset-0 w-full h-full text-gold"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Outer ornate double frame */}
        <rect x="2" y="2" width="456" height="84" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.9" />
        <rect x="6" y="6" width="448" height="76" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.55" />
        <rect x="12" y="12" width="436" height="64" fill="none" stroke="currentColor" strokeWidth="0.35" opacity="0.4" />

        {/* Corner arabesques — petal flourishes */}
        <g stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.75">
          <path d="M12 26 q0 -14 14 -14" />
          <path d="M448 12 q14 0 14 14" />
          <path d="M12 62 q0 14 14 14" />
          <path d="M448 76 q14 0 14 -14" />
        </g>
        {/* Tiny corner dots */}
        <g fill="currentColor" opacity="0.7">
          <circle cx="20" cy="20" r="0.9" />
          <circle cx="440" cy="20" r="0.9" />
          <circle cx="20" cy="68" r="0.9" />
          <circle cx="440" cy="68" r="0.9" />
        </g>

        {/* Side medallions */}
        <g stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.75">
          <circle cx="34" cy="44" r="5" />
          <circle cx="34" cy="44" r="2.4" />
          <circle cx="426" cy="44" r="5" />
          <circle cx="426" cy="44" r="2.4" />
        </g>
        <g fill="currentColor" opacity="0.55">
          <circle cx="34" cy="44" r="0.9" />
          <circle cx="426" cy="44" r="0.9" />
        </g>
        {/* Decorative bridges from medallions to inner frame */}
        <g stroke="currentColor" strokeWidth="0.5" opacity="0.55">
          <path d="M40 44 H82" />
          <path d="M378 44 H420" />
          <path d="M48 41 l3 3 l-3 3" fill="none" />
          <path d="M412 41 l-3 3 l3 3" fill="none" />
        </g>

        {/* Floral crown — top centre */}
        <g stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6">
          <path d="M222 12 q8 -4 16 0" />
          <path d="M218 12 q12 -8 24 0" />
          <circle cx="230" cy="9" r="0.9" fill="currentColor" />
        </g>
        {/* Floral base — bottom centre */}
        <g stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6">
          <path d="M222 76 q8 4 16 0" />
          <circle cx="230" cy="79" r="0.9" fill="currentColor" />
        </g>
      </svg>

      <div className="relative flex flex-col items-center" style={{ lineHeight: 1 }}>
        <p
          className="text-[20px] text-foreground tracking-wide"
          style={{ fontFamily: "'KFGQPC Uthmanic Script', 'Amiri Quran', serif" }}
        >
          سُورَةُ {meta.name.replace(/^سُورَةُ\s*/, '')}
        </p>
        <p className="text-[8px] text-gold/80 font-light mt-2 tracking-[0.25em]">
          {meta.revelationType === 'Medinan' ? 'مَدَنِيَّة' : 'مَكِّيَّة'} · {meta.numberOfAyahs} آية
        </p>
      </div>
    </div>
  </div>
);

/**
 * QPC V2 page-by-page Madinah Mushaf renderer.
 *
 * SAFETY MODEL: Render Qur'an glyphs ONLY when EVERY required font file
 * has been verifiably loaded via the Font Loading API. Never display
 * unverified glyphs in a fallback font.
 */
const QuranPageReader = ({ initialPage, surahsByNumber, onClose, onPageChange, inline = false }: Props) => {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<QpcPageData | null>(null);
  const [neighbourData, setNeighbourData] = useState<Map<number, QpcPageData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>(getStoredOrientation);
  const [fontSize, setFontSize] = useState<number>(getStoredFontSize);
  const [jumpValue, setJumpValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist orientation + font size
  useEffect(() => {
    try { localStorage.setItem(ORIENTATION_KEY, orientation); } catch { /* ignore */ }
  }, [orientation]);
  useEffect(() => {
    try { localStorage.setItem(FONT_SIZE_KEY, String(fontSize)); } catch { /* ignore */ }
  }, [fontSize]);

  // Preload neighbour pages so swiping is instant
  useEffect(() => {
    const preload = async (p: number) => {
      try {
        const d = await fetchPageData(p);
        await Promise.all(uniqueFontPagesFor(d.words).map(loadPageFont));
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

  // Load current page data + ALL fonts referenced by its words.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFontsReady(false);
    setData(null);

    (async () => {
      try {
        const pageData = await fetchPageData(page);
        if (cancelled) return;
        setData(pageData);

        const required = uniqueFontPagesFor(pageData.words);
        if (required.length === 0) throw new Error('No font pages identified');

        const results = await Promise.all(required.map(loadPageFont));
        if (cancelled) return;
        if (!results.every(Boolean)) throw new Error('Font verification failed');

        setFontsReady(true);
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

  // Determine surah of the FIRST verse on the current page (for footer label)
  const currentSurahNumber = useMemo(() => {
    if (!data || !data.words.length) return null;
    const first = data.words[0];
    return parseVerseKey(first.verse_key)?.surah ?? null;
  }, [data]);
  const currentSurahMeta = currentSurahNumber ? surahsByNumber.get(currentSurahNumber) : undefined;

  const isCentered = page <= 2;

  // RTL mushaf: forward (next page = page+1) is on the LEFT.
  const goPrev = () => page > 1 && setPage(p => p - 1);
  const goNext = () => page < 604 && setPage(p => p + 1);

  const retry = () => {
    setError(null);
    setLoading(true);
    setFontsReady(false);
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

  // Horizontal mode: render a 3-page rail (prev / current / next) and let the
  // user swipe between them with snap-scrolling. We snap back to the centre
  // after each interaction by updating `page`.
  const horizontalRailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (orientation !== 'horizontal' || !horizontalRailRef.current) return;
    // Centre the rail on the current page (middle slot)
    const el = horizontalRailRef.current;
    const w = el.clientWidth;
    el.scrollTo({ left: w, behavior: 'auto' });
  }, [orientation, page]);

  const onHorizontalScroll = () => {
    const el = horizontalRailRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const idx = Math.round(el.scrollLeft / w); // 0 = prev, 1 = current, 2 = next
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
      {/* Top bar: orientation toggle on right, settings on left */}
      <div className={`${inline ? 'sticky top-[41px] z-30' : 'flex-shrink-0'} px-4 py-2.5 flex items-center justify-between border-b border-border/10 bg-background/85 backdrop-blur-2xl`}>
        {/* RIGHT (in RTL = first child): orientation toggle */}
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

        {/* CENTER: title (mushaf name + riwayah) */}
        <div className="text-center pointer-events-none">
          <p className="text-[11px] text-foreground/85 font-medium tracking-wide">
            مُصْحَفُ المَدِينَةِ النَبَوِيَّة
          </p>
          <p className="text-[8px] text-muted-foreground/55 font-light mt-0.5 tracking-[0.15em]">
            بِرِوَايَةِ حَفْصٍ عَنْ عَاصِم
          </p>
        </div>

        {/* LEFT (in RTL = last child): settings */}
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

      {/* Settings overlay — page jump + font size + orientation */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
            onClick={() => setShowSettings(false)}
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
                  onClick={() => setShowSettings(false)}
                  className="w-7 h-7 rounded-full bg-secondary/40 flex items-center justify-center active:scale-95"
                  aria-label="إغلاق"
                >
                  <X className="w-3.5 h-3.5 text-foreground/60" />
                </button>
              </div>

              {/* Page jump */}
              <div className="mb-4">
                <p className="text-[11px] text-muted-foreground/70 font-light mb-2">انتقال إلى صفحة (١ – ٦٠٤)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={604}
                    autoFocus
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
              <div className="mb-4">
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

              {/* Font size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-muted-foreground/70 font-light">حجم الخط</p>
                  <p className="text-[11px] text-foreground/70 tabular-nums">{fontSize}px</p>
                </div>
                <input
                  type="range"
                  min={18}
                  max={38}
                  step={1}
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
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
              جارٍ التحقق من خط الصفحة…
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-6">
            <AlertTriangle className="w-6 h-6 text-foreground/40 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[12px] text-foreground/80 font-medium leading-relaxed mb-1">
              تعذّر التحقق من خط المصحف
            </p>
            <p className="text-[11px] text-muted-foreground/65 font-light leading-relaxed mb-4">
              لم نعرض الصفحة لتجنّب أي تشويه — تحقّق من اتصال الإنترنت وأعد المحاولة.
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

        {!loading && !error && fontsReady && data && orientation === 'vertical' && (
          <PageContent
            data={data}
            surahsByNumber={surahsByNumber}
            isCentered={isCentered}
            fontSize={fontSize}
          />
        )}

        {!loading && !error && fontsReady && data && orientation === 'horizontal' && (
          <div
            ref={horizontalRailRef}
            onScroll={onHorizontalScroll}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
            dir="rtl"
          >
            {/* In RTL, left scroll = next page. We render [next, current, prev]
                in DOM order so that left-to-right scroll position semantics
                (scrollLeft 0 = leftmost = next page) are reversed to feel
                natural for Arabic readers. We keep order [prev, current, next]
                and rely on RTL flex ordering for visual mirroring. */}
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
                      surahsByNumber={surahsByNumber}
                      isCentered={p <= 2}
                      fontSize={fontSize}
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

      {/* Animated footer — surah name + page number with motion */}
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

          {/* Animated centre pill — surah name + page number */}
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
                <span
                  className="text-[12px] text-foreground/85 truncate max-w-[60%]"
                  style={{ fontFamily: "'KFGQPC Uthmanic Script', 'Amiri Quran', serif" }}
                >
                  {currentSurahMeta ? `سُورَةُ ${currentSurahMeta.name.replace(/^سُورَةُ\s*/, '')}` : '—'}
                </span>
                <span className="w-px h-4 bg-border/50" />
                <span className="text-[11px] text-muted-foreground/70 font-light tabular-nums whitespace-nowrap">
                  ص {page} / 604
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

        {/* Slim animated progress bar across the mushaf */}
        <div className="mt-1.5 h-[2px] bg-secondary/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold/70 to-primary/80 rounded-full"
            initial={false}
            animate={{ width: `${(page / 604) * 100}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default QuranPageReader;
