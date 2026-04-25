import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  fetchPageData,
  loadPageFont,
  groupByLine,
  pageFontFamily,
  parseVerseKey,
  type QpcPageData,
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
 * Each page uses its own woff2 font that contains glyphs for the words on that
 * page. We fetch (page → words list with `code_v2` glyphs + `line_number`)
 * from quran.com v4 API, group by line, and render each line in the page's
 * dedicated font with `text-align: justify` so the layout matches the printed
 * mushaf exactly. Ayah end-markers are part of the font (a stylized circle
 * with the verse number), drawn via the same glyph mechanism.
 */
const QuranPageReader = ({ initialPage, surahsByNumber, onClose, onPageChange }: Props) => {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<QpcPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fontReady, setFontReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload neighbour fonts so swiping is instant
  useEffect(() => {
    if (page > 1) loadPageFont(page - 1).catch(() => {});
    if (page < 604) loadPageFont(page + 1).catch(() => {});
  }, [page]);

  // Load current page data + font in parallel
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setFontReady(false);
    setData(null);

    (async () => {
      try {
        const [pageData] = await Promise.all([
          fetchPageData(page),
          loadPageFont(page).then(() => !cancelled && setFontReady(true)),
        ]);
        if (cancelled) return;
        setData(pageData);
        onPageChange?.(page);
      } catch {
        if (!cancelled) setError(true);
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
    if (!data) return new Map<number, number>(); // line_number → surah_number
    const map = new Map<number, number>();
    for (const w of data.words) {
      if (w.verse_key && w.verse_key.endsWith(':1')) {
        const parsed = parseVerseKey(w.verse_key);
        if (parsed && !map.has(w.line_number)) {
          // Place banner just BEFORE the line where ayah 1 appears
          map.set(w.line_number, parsed.surah);
        }
      }
    }
    return map;
  }, [data]);

  // Pages 1 and 2 (Fatihah & start of Baqarah) center vertically — others justify
  const isCentered = page <= 2;

  const goPrev = () => page > 1 && setPage(p => p - 1);
  const goNext = () => page < 604 && setPage(p => p + 1);

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
        {(loading || !fontReady) && !error && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-center py-16 px-6">
            <p className="text-[12px] text-muted-foreground/70 font-light leading-relaxed">
              تعذّر تحميل الصفحة — تحقق من الاتصال وحاول مجدداً
            </p>
            <button
              onClick={() => setPage(p => p)}
              className="mt-4 px-4 py-2 rounded-full bg-secondary/40 text-[11px] text-foreground active:scale-95"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && !error && fontReady && data && (
          <div
            className={`mx-auto max-w-2xl px-6 py-8 ${isCentered ? 'min-h-[70vh] flex flex-col justify-center' : ''}`}
            style={{
              fontFamily: pageFontFamily(page),
              // Per-glyph metrics tuned for QPC v2: each glyph shapes itself.
              // Use a comfortable size and large line-height matching the printed mushaf.
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
                  {/* Surah-name banner before the first line of a new surah */}
                  {surahMeta && (
                    <div className="my-4 text-center" style={{ fontFamily: 'inherit' }}>
                      <div className="inline-block rounded-md border border-gold/35 bg-gold/[0.06] px-6 py-2">
                        <p
                          className="text-[15px] text-foreground/85 font-medium"
                          style={{ fontFamily: '"IBM Plex Sans Arabic", system-ui' }}
                        >
                          سورة {surahMeta.name.replace(/^سُورَةُ\s*/, '').replace(/[\u064B-\u065F\u0670]/g, '')}
                        </p>
                        <p
                          className="text-[9px] text-muted-foreground/60 font-light mt-0.5"
                          style={{ fontFamily: '"IBM Plex Sans Arabic", system-ui' }}
                        >
                          {surahMeta.numberOfAyahs} آية · {surahMeta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Bismillah for surahs other than 1 and 9 — drawn from the page font itself */}
                  {surahMeta && surahMeta.number !== 1 && surahMeta.number !== 9 && (
                    <p className="text-center my-3" style={{ fontFamily: pageFontFamily(1), fontSize: 22, lineHeight: 1.8 }}>
                      {/* Bismillah glyphs from page 1 font (always loaded for first surah) */}
                      ﱁﱂﱃﱄ
                    </p>
                  )}
                  {/* The actual line — words spaced and justified to fill the line width */}
                  <p
                    className="quran-page-line"
                    style={{
                      textAlign: isCentered ? 'center' : 'justify',
                      textAlignLast: isCentered ? 'center' : 'justify',
                      direction: 'rtl',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {words.map((w, i) => (
                      <span key={i}>
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

      {/* Footer nav */}
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
