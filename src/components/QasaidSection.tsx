import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Download, Clock } from 'lucide-react';
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
  const [mode, setMode] = useState<'audio' | 'video'>('audio');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('admin_qasaid')
        .select('*')
        .order('created_at', { ascending: false });
      setRows((data as QasaidRow[]) ?? []);
    })();
  }, []);

  // Media Session API — shows persistent notification with title/cover when playing,
  // even if the user navigates away from the app or locks the device.
  useEffect(() => {
    if (!selected || mode !== 'audio' || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const cover = selected.cover_path ? publicUrl(selected.cover_path) : '';
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: selected.title,
        artist: selected.reciter,
        album: 'منصة عترة — قصائد حسينية',
        artwork: cover ? [
          { src: cover, sizes: '512x512', type: 'image/png' },
          { src: cover, sizes: '256x256', type: 'image/png' },
          { src: cover, sizes: '96x96', type: 'image/png' },
        ] : [],
      });
      navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (audioRef.current) audioRef.current.currentTime += 10;
      });
    } catch { /* no-op */ }
    return () => {
      try {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch { /* no-op */ }
    };
  }, [selected, mode]);

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

  const openItem = (q: QasaidRow) => {
    setMode(q.audio_path ? 'audio' : 'video');
    setSelected(q);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[12px] text-foreground text-right">قصائد حسينية</h2>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {filtered.length}
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" dir="rtl">
        <button
          onClick={() => setReciter(RECITER_ALL)}
          className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap transition-colors ${
            reciter === RECITER_ALL ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
          }`}
        >
          الكل
        </button>
        {reciters.map((r) => (
          <button
            key={r}
            onClick={() => setReciter(r)}
            className={`flex-shrink-0 px-3 h-7 rounded-full text-[10px] whitespace-nowrap transition-colors ${
              reciter === r ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground border border-border/30'
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
            onClick={() => openItem(q)}
            className={`w-full flex items-center gap-3 p-3 active:bg-secondary/30 transition-colors text-right ${
              i < visible.length - 1 ? 'border-b border-border/10' : ''
            }`}
          >
            {q.cover_path ? (
              <img src={publicUrl(q.cover_path)} alt={q.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" loading="lazy" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-primary" strokeWidth={1.5} />
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

              {selected.audio_path && selected.video_path && (
                <div className="flex gap-1.5 mb-3">
                  <button
                    onClick={() => setMode('audio')}
                    className={`flex-1 h-8 rounded-full text-[11px] ${mode === 'audio' ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground'}`}
                  >
                    صوت
                  </button>
                  <button
                    onClick={() => setMode('video')}
                    className={`flex-1 h-8 rounded-full text-[11px] ${mode === 'video' ? 'bg-foreground text-background' : 'bg-secondary/40 text-muted-foreground'}`}
                  >
                    فيديو
                  </button>
                </div>
              )}

              {mode === 'video' && selected.video_path ? (
                <video
                  controls
                  src={publicUrl(selected.video_path)}
                  poster={selected.cover_path ? publicUrl(selected.cover_path) : undefined}
                  className="w-full aspect-video rounded-2xl bg-black mb-4"
                  playsInline
                />
              ) : (
                <>
                  {selected.cover_path && (
                    <img
                      src={publicUrl(selected.cover_path)}
                      alt={selected.title}
                      className="w-full aspect-square rounded-2xl object-cover mb-4"
                    />
                  )}
                  {selected.audio_path && (
                    <audio
                      ref={audioRef}
                      controls
                      autoPlay
                      src={publicUrl(selected.audio_path)}
                      className="w-full mb-3"
                      preload="metadata"
                    />
                  )}
                </>
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
                {selected.video_path && (
                  <a
                    href={publicUrl(selected.video_path)}
                    download
                    className="flex-1 h-10 rounded-full bg-secondary/60 text-foreground text-[12px] flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.6} />
                    تحميل الفيديو
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QasaidSection;
