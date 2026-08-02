/**
 * أثر — internal page at /athar (v2.12.47).
 * The standalone athar.atraa.xyz site is now merged into the main platform.
 *
 * Features: clear categories (by sayer), fast search, favourites filter,
 * cached fetch for instant re-entry, and copy/share/save from the list.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Bookmark, ChevronLeft, Loader2 } from 'lucide-react';
import { fetchAthar, isAtharSaved, toggleAtharSaved, type AtharQuote } from '@/lib/athar';

const CACHE_KEY = 'atraa_athar_cache_v1';

const readCache = (): AtharQuote[] => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AtharQuote[]) : [];
  } catch { return []; }
};

const AtharPage = () => {
  const [items, setItems] = useState<AtharQuote[]>(readCache);
  const [loading, setLoading] = useState(items.length === 0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const [visible, setVisible] = useState(24);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const data = await fetchAthar(500);
      if (!alive) return;
      if (data.length) {
        setItems(data);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((it) => counts.set(it.sayer, (counts.get(it.sayer) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return items.filter((it) => {
      if (category !== 'all' && it.sayer !== category) return false;
      if (onlySaved && !isAtharSaved(it.id)) return false;
      if (!q) return true;
      return it.text.includes(q) || it.sayer.includes(q) || (it.source ?? '').includes(q);
    });
  }, [items, query, category, onlySaved, savedTick]);

  useEffect(() => { setVisible(24); }, [query, category, onlySaved]);

  return (
    <div className="animate-fade-in pb-10" dir="rtl">
      {/* Header */}
      <div className="sticky top-[41px] z-30 bg-background/85 backdrop-blur-3xl backdrop-saturate-200">
        <div className="px-5 pt-6 pb-3 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] text-muted-foreground/50 font-light tracking-[0.32em] uppercase">
              ATRAA · ATHAR
            </span>
            <h1 className="text-[24px] text-foreground leading-none font-light">أثَر</h1>
          </div>
          <p className="text-[11px] text-muted-foreground/70 font-light leading-relaxed">
            أقوال النبي محمد صلى الله عليه وآله وسلم وأهل بيته عليهم السلام — مكتبة منتقاة بمعرّف فريد لكل مقولة.
          </p>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60"
              strokeWidth={1.6}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في النص أو القائل أو المصدر…"
              className="w-full h-11 pr-10 pl-9 rounded-2xl glass-card-soft border border-border/30 text-[12px] text-foreground outline-none focus:border-primary/45 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="مسح البحث"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.6} />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
            <button
              onClick={() => { setCategory('all'); setOnlySaved(false); }}
              className={`shrink-0 h-8 px-3 rounded-full text-[11px] border transition-colors ${
                category === 'all' && !onlySaved
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-secondary/35 text-foreground/75 border-border/25'
              }`}
            >
              الكل · {items.length}
            </button>
            <button
              onClick={() => { setOnlySaved((v) => !v); setCategory('all'); }}
              className={`shrink-0 h-8 px-3 rounded-full text-[11px] border inline-flex items-center gap-1 transition-colors ${
                onlySaved
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-secondary/35 text-foreground/75 border-border/25'
              }`}
            >
              <Bookmark className="w-3 h-3" strokeWidth={1.6} /> المحفوظة
            </button>
            {categories.map(([name, count]) => (
              <button
                key={name}
                onClick={() => { setCategory(name); setOnlySaved(false); }}
                className={`shrink-0 h-8 px-3 rounded-full text-[11px] border transition-colors ${
                  category === name
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'bg-secondary/35 text-foreground/75 border-border/25'
                }`}
              >
                {name} · {count}
              </button>
            ))}
          </div>
        </div>
        <div className="h-px mx-5 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      </div>

      {/* List */}
      <div className="px-5 pt-4">
        {loading && items.length === 0 ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/25 bg-card/60 p-10 text-center">
            <p className="text-[11px] text-muted-foreground/70 font-light">لا توجد مقولات مطابقة.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filtered.slice(0, visible).map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i, 8) * 0.02 }}
                  className="relative rounded-2xl glass-card-soft border border-border/25 p-4 flex flex-col gap-3"
                >
                  <Link to={`/athar/${q.id}`} className="flex-1 active:opacity-70 transition-opacity">
                    <p className="text-[12.5px] text-foreground leading-loose font-light line-clamp-5">
                      {q.text}
                    </p>
                  </Link>
                  <div className="flex items-end justify-between gap-2 pt-2.5 border-t border-border/15">
                    <span className="text-[10px] text-muted-foreground/70 font-light truncate">{q.sayer}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { toggleAtharSaved(q.id); setSavedTick((t) => t + 1); }}
                        aria-label="حفظ"
                        className="text-muted-foreground/60 active:scale-90 transition-transform"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${isAtharSaved(q.id) ? 'text-gold fill-current' : ''}`}
                          strokeWidth={1.6}
                        />
                      </button>
                      <Link to={`/athar/${q.id}`} aria-label="التفاصيل" className="text-muted-foreground/50">
                        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {visible < filtered.length && (
              <button
                onClick={() => setVisible((v) => v + 24)}
                className="mt-4 w-full h-11 rounded-2xl bg-secondary/40 border border-border/25 text-[12px] text-foreground/80"
              >
                عرض المزيد ({filtered.length - visible})
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AtharPage;
