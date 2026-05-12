/**
 * Qasaid (قصائد) public homepage — qasaid.atraa.xyz
 * Standalone listening site for Husayni elegies and podcasts.
 */
import { useEffect, useMemo, useState } from 'react';
import { Search, Play, Pause, Headphones, Repeat, Repeat1, SkipBack, SkipForward, RotateCcw, RotateCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  QasaidPlayerProvider,
  useQasaidPlayer,
  qasaidPublicUrl,
  type QasaidTrack,
} from '@/contexts/QasaidPlayerContext';

interface Row extends QasaidTrack {
  details: string | null;
  created_at: string;
}

const fmt = (s: number) => {
  if (!s || !Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

const QasaidPlayerBar = () => {
  const { current, isPlaying, toggle, position, duration, repeat, cycleRepeat, next, prev, seekBy, seek } = useQasaidPlayer();
  if (!current) return null;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 bg-background/85 backdrop-blur-2xl border-t border-border/15"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          {current.cover_path ? (
            <img src={qasaidPublicUrl(current.cover_path)} alt="" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-foreground truncate">{current.title}</p>
            <p className="text-[10px] text-muted-foreground/70 font-light truncate">{current.reciter}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground/60 tabular-nums w-9 text-center" dir="ltr">
            {fmt(position)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={position}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 h-1 accent-primary"
          />
          <span className="text-[9px] text-muted-foreground/60 tabular-nums w-9 text-center" dir="ltr">
            {fmt(duration)}
          </span>
        </div>
        <div className="flex items-center justify-center gap-1 mt-2">
          <button onClick={cycleRepeat} className={`w-9 h-9 rounded-full flex items-center justify-center ${repeat !== 'off' ? 'text-primary' : 'text-foreground/70'}`}>
            <RepeatIcon className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button onClick={prev} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70">
            <SkipBack className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button onClick={() => seekBy(-10)} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70">
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button onClick={toggle} className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            {isPlaying ? <Pause className="w-4 h-4" strokeWidth={1.8} /> : <Play className="w-4 h-4" strokeWidth={1.8} />}
          </button>
          <button onClick={() => seekBy(10)} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70">
            <RotateCw className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button onClick={next} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70">
            <SkipForward className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

const QasaidHomeInner = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [reciter, setReciter] = useState<string>('__all__');
  const [category, setCategory] = useState<string>('__all__');
  const [query, setQuery] = useState('');
  const { setQueue, current } = useQasaidPlayer();

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('admin_qasaid')
        .select('*')
        .order('created_at', { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const reciters = useMemo(
    () => Array.from(new Set(rows.map((r) => r.reciter).filter(Boolean))),
    [rows],
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (category !== '__all__') list = list.filter((r) => r.category === category);
    if (reciter !== '__all__') list = list.filter((r) => r.reciter === reciter);
    const q = query.trim();
    if (q) list = list.filter((r) => r.title.includes(q) || r.reciter.includes(q));
    return list;
  }, [rows, category, reciter, query]);

  const playFrom = (idx: number) => {
    const tracks: QasaidTrack[] = filtered
      .filter((r) => r.audio_path)
      .map((r) => ({
        id: r.id,
        title: r.title,
        reciter: r.reciter,
        cover_path: r.cover_path,
        audio_path: r.audio_path,
        duration_seconds: r.duration_seconds,
      }));
    const realIdx = tracks.findIndex((t) => t.id === filtered[idx].id);
    if (realIdx >= 0) setQueue(tracks, realIdx);
  };

  return (
    <div className="min-h-screen bg-background pb-40" dir="rtl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/10">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-foreground leading-none">قصائد حسينية</p>
            <p className="text-[9px] text-muted-foreground/60 font-light mt-0.5">منصة عترة الدينية</p>
          </div>
          <a href="https://atraa.xyz" className="text-[10px] text-muted-foreground/70 font-light">atraa.xyz</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5">
        <section className="pt-10 pb-6 text-center">
          <p className="text-[10px] text-muted-foreground/60 mb-3 font-light tracking-[0.3em]">قصائد · بودكاست</p>
          <h1 className="text-[22px] text-foreground font-light leading-relaxed mb-3">
            مكتبة القصائد الحسينية
          </h1>
          <p className="text-[12px] text-muted-foreground/80 font-light leading-relaxed max-w-md mx-auto">
            استماع، تكرار، مشاركة — موقع متخصّص للروادي والبودكاست الحسيني.
          </p>
        </section>

        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.6} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بعنوان أو رادود…"
            className="w-full h-11 pr-9 pl-3 rounded-2xl bg-secondary/40 border border-border/30 text-[12px] text-foreground outline-none focus:border-primary/40"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: '__all__', label: 'الكل' },
            { key: 'qasaid', label: 'قصائد' },
            { key: 'podcast', label: 'بودكاست' },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-shrink-0 px-3 h-8 rounded-full text-[10px] ${
                category === c.key ? 'bg-foreground text-background' : 'bg-secondary/40 text-foreground border border-border/30'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
          <button
            onClick={() => setReciter('__all__')}
            className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] ${
              reciter === '__all__' ? 'bg-foreground text-background' : 'bg-secondary/30 text-muted-foreground border border-border/30'
            }`}
          >
            الكل
          </button>
          {reciters.map((r) => (
            <button
              key={r}
              onClick={() => setReciter(r)}
              className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] ${
                reciter === r ? 'bg-foreground text-background' : 'bg-secondary/30 text-muted-foreground border border-border/30'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/15 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-card p-10 text-center">
            <p className="text-[11px] text-muted-foreground/70 font-light">لا توجد قصائد مطابقة.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((q, i) => {
              const isCurrent = current?.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => playFrom(i)}
                  className={`w-full text-right rounded-2xl border bg-card overflow-hidden active:opacity-80 ${isCurrent ? 'border-primary/40' : 'border-border/30'}`}
                >
                  <div className="flex items-center gap-3 p-3">
                    {q.cover_path ? (
                      <img src={qasaidPublicUrl(q.cover_path)} alt={q.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {q.category === 'podcast' ? (
                          <Headphones className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        ) : (
                          <Play className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground truncate">{q.title}</p>
                      <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 truncate">{q.reciter}</p>
                    </div>
                    <Play className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" strokeWidth={1.6} />
                  </div>
                  {q.details && (
                    <p className="px-3 pb-3 text-[11px] text-muted-foreground/80 font-light leading-relaxed line-clamp-2">{q.details}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-border/15 text-center pb-6">
          <p className="text-[10px] text-muted-foreground/60 font-light leading-relaxed">
            مشروع تابع لـ <a href="https://atraa.xyz" className="text-foreground">منصة عترة الدينية</a>
            <br />© 2024–2026 · جميع الحقوق محفوظة
          </p>
        </footer>
      </main>

      <QasaidPlayerBar />
    </div>
  );
};

const QasaidHomePage = () => (
  <QasaidPlayerProvider>
    <QasaidHomeInner />
  </QasaidPlayerProvider>
);

export default QasaidHomePage;
