/**
 * Athar (أثر) public homepage — athar.atraa.xyz
 * A dedicated browsing experience for the prophetic & Imami sayings.
 * Sepia-locked design matching Atraa's restricted visual system.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { AtharQuote } from '@/lib/athar';
import logoAthar from '@/assets/logo-athar.png';

type Sect = 'all' | 'shia' | 'sunni' | 'both';

const AtharHomePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AtharQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sect, setSect] = useState<Sect>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('athar_quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(120);
      setItems((data as AtharQuote[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (sect !== 'all') list = list.filter((q) => q.sect === sect);
    const q = query.trim();
    if (q) list = list.filter((it) => it.text.includes(q) || it.sayer.includes(q));
    return list;
  }, [items, sect, query]);

  return (
    <div className="min-h-screen bg-background" dir="rtl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/10">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoAthar} alt="أثر" className="h-7 w-auto" />
            <div>
              <p className="text-[13px] text-foreground leading-none">أثر</p>
              <p className="text-[9px] text-muted-foreground/60 font-light mt-0.5">منصة عترة الدينية</p>
            </div>
          </div>
          <a
            href="https://atraa.xyz"
            className="text-[10px] text-muted-foreground/70 font-light"
          >
            atraa.xyz
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-16">
        {/* Hero */}
        <section className="pt-10 pb-8 text-center">
          <p className="text-[10px] text-muted-foreground/60 mb-3 font-light tracking-[0.3em]">
            أثر · ATHAR
          </p>
          <h1 className="text-[22px] text-foreground font-light leading-relaxed mb-3">
            أقوال النبي محمد ﷺ
            <br />
            وأهل البيت عليهم السلام
          </h1>
          <p className="text-[12px] text-muted-foreground/80 font-light leading-relaxed max-w-md mx-auto">
            مكتبة منتقاة من المقولات والوصايا، بمعرّف فريد لكل مقولة لتسهيل المشاركة.
          </p>
        </section>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.6} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في النص أو القائل…"
            className="w-full h-11 pr-9 pl-3 rounded-2xl bg-secondary/40 border border-border/30 text-[12px] text-foreground outline-none focus:border-primary/40"
          />
        </div>

        {/* Sect filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
          {([
            ['all', 'الكل'],
            ['shia', 'شيعي'],
            ['sunni', 'سني'],
            ['both', 'مشترك'],
          ] as [Sect, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setSect(k)}
              className={`flex-shrink-0 px-3 h-8 rounded-full text-[10px] transition-colors ${
                sect === k
                  ? 'bg-foreground text-background'
                  : 'bg-secondary/40 text-foreground border border-border/30'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/15 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-card p-10 text-center">
            <p className="text-[11px] text-muted-foreground/70 font-light">
              لا توجد مقولات مطابقة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filtered.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate(`/${q.id}`)}
                className="relative text-right rounded-2xl border border-border/30 bg-card p-4 active:bg-secondary/30 transition-colors flex flex-col gap-3 min-h-[140px]"
              >
                <p className="text-[12px] text-foreground leading-loose font-light line-clamp-5 flex-1">
                  {q.text}
                </p>
                <div className="flex items-end justify-between gap-2 pt-2 border-t border-border/15">
                  <span className="text-[10px] text-muted-foreground/70 font-light truncate">
                    {q.sayer}
                  </span>
                  <span className="text-[8px] text-muted-foreground/50 tabular-nums">
                    {q.id}
                  </span>
                </div>
                <ArrowUpLeft
                  className="absolute top-3 left-3 w-3 h-3 text-muted-foreground/40"
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/15 text-center">
          <p className="text-[10px] text-muted-foreground/60 font-light leading-relaxed">
            مشروع تابع لـ <a href="https://atraa.xyz" className="text-foreground">منصة عترة الدينية</a>
            <br />
            © 2024–2026 · جميع الحقوق محفوظة
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AtharHomePage;
