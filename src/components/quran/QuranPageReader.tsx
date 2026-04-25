import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
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
  /** First page to open at */
  initialPage: number;
  /** Map of surah-number → metadata, used for the surah-name banner */
  surahsByNumber: Map<number, SurahMeta>;
  onClose: () => void;
  onPageChange?: (page: number) => void;
}

/**
 * QPC V2 page-by-page Madinah Mushaf renderer.
 *
 * SAFETY MODEL: We render the Qur'an glyphs ONLY when EVERY required font
 * file (one per `v2_page` referenced by any word on this page) has been
 * verifiably loaded via the Font Loading API. If any font fails, we show
 * an explicit error — never the wrong glyphs in a fallback font.
 */
const QuranPageReader = ({ initialPage, surahsByNumber, onClose, onPageChange }: Props) => {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<QpcPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload neighbour pages (data + their fonts) so swiping is instant
  useEffect(() => {
    const preload = async (p: number) => {
      try {
        const d = await fetchPageData(p);
        await Promise.all(uniqueFontPagesFor(d.words).map(loadPageFont));
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
        // 1) Fetch the canonical word list for this page.
        const pageData = await fetchPageData(page);
        if (cancelled) return;
        setData(pageData);

        // 2) Identify every font page referenced — usually just one, but
        //    pages where surahs/juz cross boundaries can reference more.
        const required = uniqueFontPagesFor(pageData.words);
        if (required.length === 0) {
          throw new Error('No font pages identified');
        }

        // 3) Load and VERIFY every required font. ALL must succeed.
        const results = await Promise.all(required.map(loadPageFont));
        if (cancelled) return;
        if (!results.every(Boolean)) {
          throw new Error('Font verification failed');
        }

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

  // Scroll to top on page change
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [page]);

  const lines = useMemo(() => {
    if (!data) return [];
    const grouped = groupByLine(data.words);
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [data]);

  // Determine which surahs start on this page (for surah header banners)
  const surahStartsOnPage = useMemo(() => {
    if (!data) return new Map<number, number>();
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

  // Pages 1 and 2 (Fatihah & start of Baqarah) center vertically — others justify
  const isCentered = page <= 2;

  // In RTL mushaf, "next page" is page+1 (forward in reading order = LEFT button).
  const goPrev = () => page > 1 && setPage(p => p - 1);
  const goNext = () => page < 604 && setPage(p => p + 1);

  const retry = () => {
    // Force re-run by toggling page state to itself
    setError(null);
    setLoading(true);
    setFontsReady(false);
    setData(null);
    setPage(p => p);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
      dir="rtl"
    >
      {/* Header bar */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between border-b border-border/10 bg-background/85 backdrop-blur-2xl">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4 text-foreground/70" />
        </button>
        <div className="text-center">
          <p className="text-[12px] text-foreground/85 font-medium tabular-nums">
            صفحة {page}
          </p>
          <p className="text-[9px] text-muted-foreground/55 font-light">
            مصحف المدينة · رواية حفص
          </p>
        </div>
        <div className="w-9 h-9" />
      </div>

      {/* Page body */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
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
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-secondary/40 text-[11px] text-foreground active:scale-95"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {!loading && !error && fontsReady && data && (
          <div
            className={`mx-auto max-w-2xl px-6 py-8 ${isCentered ? 'min-h-[70vh] flex flex-col justify-center' : ''}`}
            style={{
              fontSize: '26px',
              lineHeight: 2.0,
              direction: 'rtl',
            }}
          >
            {lines.map(([lineNum, words]) => {
              const surahHeader = surahStartsOnPage.get(lineNum);
              const surahMeta = surahHeader ? surahsByNumber.get(surahHeader) : undefined;
              return (
                <div key={lineNum}>
                  {/* Surah header — Madinah Mushaf style illuminated band */}
                  {surahMeta && (
                    <div className="my-5 text-center select-none">
                      <div className="relative mx-auto max-w-[420px] h-[64px] flex items-center justify-center">
                        {/* Illuminated frame mimicking the printed mushaf header */}
                        <svg
                          viewBox="0 0 420 64"
                          className="absolute inset-0 w-full h-full text-gold/70"
                          preserveAspectRatio="none"
                          aria-hidden
                        >
                          <rect x="2" y="2" width="416" height="60" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <rect x="6" y="6" width="408" height="52" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
                          <path d="M2 32 H40 M380 32 H418" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                          <circle cx="22" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          <circle cx="398" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          <path d="M14 8 q-6 4 0 8 M14 56 q-6 -4 0 -8 M406 8 q6 4 0 8 M406 56 q6 -4 0 -8" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.7" />
                        </svg>
                        <p
                          className="relative text-[17px] text-foreground tracking-wide quran-uthmani"
                          style={{ lineHeight: 1 }}
                        >
                          سُورَةُ {surahMeta.name.replace(/^سُورَةُ\s*/, '')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* The actual line — words spaced and justified to fill the line width.
                      Each <span> uses the FONT for its OWN word's v2_page. */}
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
        )}
      </div>

      {/* Footer nav — RTL: forward (next page = page+1) is on the LEFT */}
      <div className="flex-shrink-0 border-t border-border/10 bg-background/85 backdrop-blur-2xl px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={goNext}
          disabled={page >= 604}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/40 text-[12px] text-foreground disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>التالية</span>
        </button>
        <span className="text-[10px] text-muted-foreground/55 tabular-nums font-light">
          {page} / 604
        </span>
        <button
          onClick={goPrev}
          disabled={page <= 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/40 text-[12px] text-foreground disabled:opacity-30 active:scale-95"
        >
          <span>السابقة</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default QuranPageReader;
