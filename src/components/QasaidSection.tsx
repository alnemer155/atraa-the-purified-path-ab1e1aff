import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQasaidPlayer, qasaidPublicUrl, type QasaidTrack } from '@/contexts/QasaidPlayerContext';
import QasaidCommentsSheet from './QasaidCommentsSheet';

interface QasaidRow extends QasaidTrack {
  details: string | null;
  video_path: string | null;
  created_at: string;
}

const RECITER_ALL = '__all__';
const CAT_ALL = '__all__';

const formatDuration = (s: number | null) => {
  if (!s || s <= 0) return '';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
};

const QasaidSection = () => {
  const [rows, setRows] = useState<QasaidRow[]>([]);
  const [reciter, setReciter] = useState<string>(RECITER_ALL);
  const [category, setCategory] = useState<string>(CAT_ALL);
  const [openId, setOpenId] = useState<string | null>(null);
  const { setQueue, current } = useQasaidPlayer();

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('admin_qasaid')
        .select('*')
        .order('created_at', { ascending: false });
      setRows((data as QasaidRow[]) ?? []);
    })();
  }, []);

  const reciters = useMemo(() => Array.from(new Set(rows.map(r => r.reciter).filter(Boolean))), [rows]);
  const filtered = useMemo(() => {
    let list = rows;
    if (category !== CAT_ALL) list = list.filter(r => r.category === category);
    if (reciter !== RECITER_ALL) list = list.filter(r => r.reciter === reciter);
    return list;
  }, [rows, category, reciter]);

  const visible = filtered.slice(0, 3);
  const hiddenCount = Math.max(0, filtered.length - 3);

  if (rows.length === 0) return null;

  const playFrom = (idx: number) => {
    const tracks: QasaidTrack[] = filtered.filter(r => r.audio_path).map((r) => ({
      id: r.id, title: r.title, reciter: r.reciter,
      cover_path: r.cover_path, audio_path: r.audio_path, duration_seconds: r.duration_seconds,
    }));
    const realIdx = tracks.findIndex((t) => t.id === filtered[idx].id);
    if (realIdx >= 0) setQueue(tracks, realIdx);
    setOpenId(filtered[idx].id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[12px] text-foreground text-right">قصائد حسينية والمزيد</h2>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {filtered.length}
        </span>
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" dir="rtl">
        {[
          { key: CAT_ALL, label: 'الكل' },
          { key: 'qasaid', label: 'قصائد' },
          { key: 'podcast', label: 'بودكاست' },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap transition-colors ${
              category === c.key ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
            }`}
          >{c.label}</button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" dir="rtl">
        <button
          onClick={() => setReciter(RECITER_ALL)}
          className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap transition-colors ${
            reciter === RECITER_ALL ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
          }`}
        >الكل</button>
        {reciters.map((r) => (
          <button
            key={r}
            onClick={() => setReciter(r)}
            className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap transition-colors ${
              reciter === r ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
            }`}
          >{r}</button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
        {visible.map((q, i) => {
          const isCurrent = current?.id === q.id;
          return (
            <button
              key={q.id}
              onClick={() => playFrom(i)}
              className={`w-full flex items-center gap-3 p-3 active:bg-secondary/30 transition-colors text-right ${
                i < visible.length - 1 ? 'border-b border-border/10' : ''
              } ${isCurrent ? 'bg-primary/5' : ''}`}
            >
              {q.cover_path ? (
                <img src={qasaidPublicUrl(q.cover_path)} alt={q.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" loading="lazy" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {q.category === 'podcast' ? (
                    <Headphones className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  ) : (
                    <Play className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-foreground truncate">{q.title}</p>
                <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 truncate">
                  {q.reciter}{q.duration_seconds ? ` · ${formatDuration(q.duration_seconds)}` : ''}
                </p>
              </div>
              <Play className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" strokeWidth={1.6} />
            </button>
          );
        })}

        <a
          href="https://qasaid.atraa.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between p-3 border-t border-border/10 text-[11px] text-primary active:bg-secondary/30 transition-colors"
        >
          <span>المزيد على qasaid.atraa.xyz{hiddenCount > 0 ? ` (${hiddenCount}+)` : ''}</span>
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
        </a>
      </div>

      <QasaidCommentsSheet qasidaId={openId ?? ''} open={!!openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

export default QasaidSection;
