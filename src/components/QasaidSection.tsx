import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, X, Download, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QasaidRow {
  id: string;
  title: string;
  reciter: string;
  details: string | null;
  duration_seconds: number | null;
  cover_path: string | null;
  audio_path: string | null;
  video_path: string | null;
  created_at: string;
}

const RECITER_ALL = '__all__';

const formatDuration = (s: number | null) => {
  if (!s || s <= 0) return '';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
};

const publicUrl = (path: string | null) =>
  path ? supabase.storage.from('qasaid-media').getPublicUrl(path).data.publicUrl : '';

const QasaidSection = () => {
  const [rows, setRows] = useState<QasaidRow[]>([]);
  const [reciter, setReciter] = useState<string>(RECITER_ALL);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<QasaidRow | null>(null);
  const [lockedNotice, setLockedNotice] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('admin_qasaid')
        .select('*')
        .order('created_at', { ascending: false });
      setRows((data as QasaidRow[]) ?? []);
    })();
  }, []);

  const reciters = useMemo(
    () => Array.from(new Set(rows.map(r => r.reciter).filter(Boolean))),
    [rows],
  );

  const filtered = useMemo(
    () => reciter === RECITER_ALL ? rows : rows.filter(r => r.reciter === reciter),
    [rows, reciter],
  );

  const visible = showAll ? filtered : filtered.slice(0, 3);
  const hiddenCount = Math.max(0, filtered.length - 3);

  if (rows.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[12px] text-foreground text-right">قصائد حسينية</h2>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {filtered.length}
        </span>
      </div>

      {/* Reciter filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" dir="rtl">
        <button
          onClick={() => setReciter(RECITER_ALL)}
          className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap transition-colors ${
            reciter === RECITER_ALL
              ? 'bg-foreground text-background'
              : 'bg-secondary/40 text-muted-foreground border border-border/30'
          }`}
        >
          الكل
        </button>
        {reciters.map((r) => (
          <button
            key={r}
            onClick={() => setReciter(r)}
            className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap transition-colors ${
              reciter === r
                ? 'bg-foreground text-background'
                : 'bg-secondary/40 text-muted-foreground border border-border/30'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
        {visible.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setSelected(q)}
            className={`w-full flex items-center gap-3 p-3 active:bg-secondary/30 transition-colors text-right ${
              i < visible.length - 1 ? 'border-b border-border/10' : ''
            }`}
          >
            {q.cover_path ? (
              <img
                src={publicUrl(q.cover_path)}
                alt={q.title}
                className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-foreground truncate">{q.title}</p>
              <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 truncate">
                {q.reciter}
                {q.duration_seconds ? ` · ${formatDuration(q.duration_seconds)}` : ''}
              </p>
            </div>
            <Play className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" strokeWidth={1.6} />
          </button>
        ))}

        {!showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full p-3 border-t border-border/10 text-[11px] text-primary active:bg-secondary/30 transition-colors"
          >
            عرض المزيد ({hiddenCount})
          </button>
        )}
      </div>

      {/* Player modal */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 z-[80] bg-background/85 backdrop-blur-sm flex items-end justify-center p-3"
            onClick={() => setSelected(null)}
            dir="rtl"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-border/30 bg-card p-5 max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground/60 mb-1">{selected.reciter}</p>
                  <p className="text-[15px] text-foreground leading-relaxed">{selected.title}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/40 flex-shrink-0"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {selected.cover_path && (
                <img
                  src={publicUrl(selected.cover_path)}
                  alt={selected.title}
                  className="w-full aspect-square rounded-2xl object-cover mb-4"
                />
              )}

              {selected.audio_path && (
                <audio
                  controls
                  src={publicUrl(selected.audio_path)}
                  className="w-full mb-3"
                  preload="metadata"
                />
              )}

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 mb-3">
                {selected.duration_seconds ? (
                  <span className="flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" strokeWidth={1.6} />
                    {formatDuration(selected.duration_seconds)}
                  </span>
                ) : null}
              </div>

              {selected.details && (
                <p className="text-[12px] text-muted-foreground leading-relaxed font-light mb-4 whitespace-pre-wrap">
                  {selected.details}
                </p>
              )}

              <div className="flex gap-2">
                {selected.audio_path && (
                  <a
                    href={publicUrl(selected.audio_path)}
                    download
                    className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.6} />
                    تحميل الصوت
                  </a>
                )}
                <button
                  onClick={() => setLockedNotice(true)}
                  className="flex-1 h-10 rounded-full bg-secondary/50 text-muted-foreground text-[12px] flex items-center justify-center gap-1.5"
                  aria-label="تحميل الفيديو"
                >
                  <Lock className="w-3.5 h-3.5" strokeWidth={1.6} />
                  تحميل الفيديو
                </button>
              </div>

              {lockedNotice && (
                <div className="mt-3 rounded-xl bg-secondary/40 border border-border/30 p-3 text-center">
                  <p className="text-[11px] text-foreground font-light">
                    ميزة الفيديو قيد التطوير — قريباً
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QasaidSection;
