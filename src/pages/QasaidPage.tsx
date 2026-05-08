/**
 * Dedicated full-screen page listing all Husayni elegies (qasaid) and podcasts.
 * Mirrors the Wallpapers "view all" layout pattern.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQasaidPlayer, qasaidPublicUrl, type QasaidTrack } from '@/contexts/QasaidPlayerContext';
import QasaidCommentsSheet from '@/components/QasaidCommentsSheet';

interface QasaidRow extends QasaidTrack {
  details: string | null;
  video_path: string | null;
  created_at: string;
}

const RECITER_ALL = '__all__';
const CAT_ALL = '__all__';

const QasaidPage = () => {
  const [rows, setRows] = useState<QasaidRow[]>([]);
  const [reciter, setReciter] = useState(RECITER_ALL);
  const [category, setCategory] = useState<string>(CAT_ALL);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const { setQueue, current } = useQasaidPlayer();

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from('admin_qasaid').select('*').order('created_at', { ascending: false });
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

  const playFrom = (idx: number) => {
    const tracks: QasaidTrack[] = filtered.filter(r => r.audio_path).map((r) => ({
      id: r.id, title: r.title, reciter: r.reciter,
      cover_path: r.cover_path, audio_path: r.audio_path, duration_seconds: r.duration_seconds,
    }));
    const realIdx = tracks.findIndex((t) => t.id === filtered[idx].id);
    if (realIdx >= 0) setQueue(tracks, realIdx);
    setCommentsFor(filtered[idx].id);
  };

  const pageTitle = category === 'podcast' ? 'بودكاست' : 'قصائد حسينية';

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40" aria-label="رجوع">
            <ChevronRight className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </Link>
          <div className="text-center">
            <p className="text-[13px] text-foreground">{pageTitle}</p>
            <p className="text-[9px] text-muted-foreground/60 font-light tabular-nums mt-0.5">{filtered.length} قصيدة</p>
          </div>
          <div className="w-9 h-9" />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-hide" dir="rtl">
          {[
            { key: CAT_ALL, label: 'الكل' },
            { key: 'qasaid', label: 'قصائد' },
            { key: 'podcast', label: 'بودكاست' },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap ${category === c.key ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'}`}
            >{c.label}</button>
          ))}
        </div>

        {/* Reciter filter */}
        <div className="flex gap-1.5 overflow-x-auto px-3 pb-3 scrollbar-hide" dir="rtl">
          <button
            onClick={() => setReciter(RECITER_ALL)}
            className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap ${reciter === RECITER_ALL ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'}`}
          >الكل</button>
          {reciters.map((r) => (
            <button
              key={r}
              onClick={() => setReciter(r)}
              className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap ${reciter === r ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'}`}
            >{r}</button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-3 space-y-2">
        {filtered.map((q, i) => {
          const isCurrent = current?.id === q.id;
          return (
            <button key={q.id} onClick={() => playFrom(i)} className={`w-full text-right rounded-2xl border bg-card overflow-hidden active:opacity-80 ${isCurrent ? 'border-primary/40' : 'border-border/30'}`}>
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
                <p className="px-3 pb-3 text-[11px] text-muted-foreground/80 font-light leading-relaxed">
                  {q.details}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <QasaidCommentsSheet
        qasidaId={commentsFor ?? ''}
        open={!!commentsFor}
        onClose={() => setCommentsFor(null)}
      />
    </div>
  );
};

export default QasaidPage;
