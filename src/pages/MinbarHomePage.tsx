import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Search, Headphones, Repeat, Repeat1, Volume2, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQasaidPlayer, qasaidPublicUrl, type QasaidTrack } from '@/contexts/QasaidPlayerContext';

interface MinbarRow extends QasaidTrack {
  details: string | null;
  share_code: string | null;
  category: 'qasaid' | 'podcast';
  created_at: string;
}

type Filter = 'all' | 'qasaid' | 'podcast';

const fmt = (s: number | null) => {
  if (!s || s <= 0) return '';
  const m = Math.floor(s / 60); const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
};

const MinbarHomePage = () => {
  const [rows, setRows] = useState<MinbarRow[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [reciter, setReciter] = useState<string>('__all__');
  const { current, isPlaying, toggle, next, previous, setQueue, repeatMode, cycleRepeat, seek, currentTime, duration } = useQasaidPlayer();

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('admin_qasaid')
        .select('*')
        .order('created_at', { ascending: false });
      setRows((data as MinbarRow[]) ?? []);
    })();
  }, []);

  const reciters = useMemo(
    () => Array.from(new Set(rows.map(r => r.reciter).filter(Boolean))),
    [rows]
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (filter !== 'all') list = list.filter(r => r.category === filter);
    if (reciter !== '__all__') list = list.filter(r => r.reciter === reciter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(s) ||
        (r.reciter || '').toLowerCase().includes(s) ||
        (r.share_code || '').toLowerCase().includes(s),
      );
    }
    return list;
  }, [rows, filter, reciter, q]);

  const playFrom = (idx: number) => {
    const tracks: QasaidTrack[] = filtered
      .filter(r => r.audio_path)
      .map(r => ({
        id: r.id, title: r.title, reciter: r.reciter,
        cover_path: r.cover_path, audio_path: r.audio_path, duration_seconds: r.duration_seconds,
      }));
    const realIdx = tracks.findIndex(t => t.id === filtered[idx].id);
    if (realIdx >= 0) setQueue(tracks, realIdx);
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* Hero brand header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,hsl(var(--primary)/0.15),transparent_60%),radial-gradient(circle_at_85%_120%,hsl(var(--gold)/0.12),transparent_55%)]" />
        <div className="relative px-6 pt-10 pb-7 text-right">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          >
            <p className="text-[10px] tracking-[0.45em] text-muted-foreground/70 uppercase">ATRAA</p>
            <h1 className="text-[36px] mt-2 leading-none font-light tracking-tight">مِنبَر</h1>
            <p className="text-[12px] mt-3 text-muted-foreground/85 font-light leading-relaxed max-w-md mr-0 ml-auto">
              منبر — منصة عترة الواحدة للقصائد الحسينية والصوتيات الدينية. مكان واحد للاستماع والمشاركة.
            </p>
          </motion.div>

          {/* Search + filters */}
          <div className="mt-7 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-2xl bg-card/70 backdrop-blur border border-border/30">
              <Search className="w-3.5 h-3.5 text-muted-foreground/70" strokeWidth={1.6} />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث بالعنوان أو القارئ أو رمز المشاركة"
                className="flex-1 bg-transparent outline-none text-[12px] text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {([['all','الكل'],['qasaid','قصائد'],['podcast','بودكاست']] as [Filter, string][]).map(([k,l]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`flex-shrink-0 px-3.5 h-8 rounded-full text-[10px] transition-colors ${
                  filter === k ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
                }`}>{l}</button>
            ))}
            <div className="w-px self-stretch bg-border/30 mx-1" />
            <button onClick={() => setReciter('__all__')}
              className={`flex-shrink-0 px-3.5 h-8 rounded-full text-[10px] transition-colors ${
                reciter === '__all__' ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
              }`}>كل القراء</button>
            {reciters.map(r => (
              <button key={r} onClick={() => setReciter(r)}
                className={`flex-shrink-0 px-3.5 h-8 rounded-full text-[10px] whitespace-nowrap transition-colors ${
                  reciter === r ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
                }`}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-2 pb-40">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground/60 text-[12px] py-20">لا توجد نتائج</div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((r, i) => {
              const isCur = current?.id === r.id;
              return (
                <button key={r.id} onClick={() => playFrom(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-colors text-right ${
                    isCur ? 'bg-primary/5 border-primary/30' : 'bg-card border-border/25 active:bg-secondary/20'
                  }`}>
                  {r.cover_path ? (
                    <img src={qasaidPublicUrl(r.cover_path)} alt={r.title}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {r.category === 'podcast' ? (
                        <Headphones className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      ) : (
                        <Play className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground/75 font-light mt-0.5 truncate">
                      {r.reciter}{r.duration_seconds ? ` · ${fmt(r.duration_seconds)}` : ''}
                      {r.share_code ? ` · #${r.share_code}` : ''}
                    </p>
                  </div>
                  {isCur && isPlaying ? (
                    <Pause className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.6} />
                  ) : (
                    <Play className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.6} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini player */}
      {current && (
        <div className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
        >
          <div className="mx-auto max-w-2xl rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-lg p-3">
            <div className="flex items-center gap-3">
              {current.cover_path ? (
                <img src={qasaidPublicUrl(current.cover_path)} alt={current.title}
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
              )}
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[12px] truncate text-foreground">{current.title}</p>
                <p className="text-[10px] text-muted-foreground/70 truncate">{current.reciter}</p>
              </div>
              <button onClick={cycleRepeat}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  repeatMode === 'off' ? 'text-muted-foreground/60' : 'text-primary bg-primary/10'
                }`}>
                <RepeatIcon className="w-4 h-4" strokeWidth={1.6} />
              </button>
              <button onClick={previous} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground active:bg-secondary/40">
                <SkipForward className="w-4 h-4" strokeWidth={1.6} />
              </button>
              <button onClick={toggle} className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {isPlaying ? <Pause className="w-4.5 h-4.5" strokeWidth={1.8} /> : <Play className="w-4.5 h-4.5" strokeWidth={1.8} />}
              </button>
              <button onClick={next} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground active:bg-secondary/40">
                <SkipBack className="w-4 h-4" strokeWidth={1.6} />
              </button>
            </div>
            <div className="mt-2.5 h-[3px] rounded-full bg-border/40 overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const ratio = 1 - (x / rect.width); // RTL
                if (duration > 0) seek(duration * ratio);
              }}>
              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Footer brand */}
      <div className="text-center text-[10px] text-muted-foreground/40 font-light py-6">
        مِنبَر — جزء من منصة عترة
      </div>
    </div>
  );
};

export default MinbarHomePage;
