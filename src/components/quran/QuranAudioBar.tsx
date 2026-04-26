import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Loader2, Settings2, Repeat } from 'lucide-react';
import {
  getAyahAudioBlobUrl,
  revokeAyahBlobUrl,
  getStoredVolume,
  setStoredVolume,
} from '@/lib/quran-audio';
import { toArabicNumerals } from '@/lib/quran-page';
import { getReciter } from '@/lib/quran-reciters';
import type { PlaybackRange, PlaybackSettings } from '@/lib/quran-playback';

interface SurahMeta {
  number: number;
  name: string;
  numberOfAyahs: number;
}

interface Props {
  current: { surah: number; ayah: number } | null;
  surahsByNumber: Map<number, SurahMeta>;
  onAyahChange?: (surah: number, ayah: number) => void;
  onStop: () => void;
  onOpenPanel?: () => void;
  /** Active playback configuration (range, repeat, speed, gap, reciter). */
  settings: PlaybackSettings;
  /** Inclusive ayah range. `null` = free-flow (no end). */
  range: PlaybackRange | null;
}

/** Compare two surah:ayah pairs — returns -1/0/1. */
const cmp = (aS: number, aA: number, bS: number, bA: number): number =>
  aS !== bS ? (aS < bS ? -1 : 1) : aA === bA ? 0 : aA < bA ? -1 : 1;

const QuranAudioBar = ({
  current,
  surahsByNumber,
  onAyahChange,
  onStop,
  onOpenPanel,
  settings,
  range,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const repeatLeftRef = useRef<number>(0); // remaining repeats for current ayah
  const cycleRef = useRef<number>(0); // completed full-range cycles
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState<number>(getStoredVolume);
  const [showVolume, setShowVolume] = useState(false);
  const [error, setError] = useState(false);

  const surahMeta = current ? surahsByNumber.get(current.surah) : undefined;
  const reciter = getReciter(settings.reciterId);

  // (Re)initialise per-ayah repeats whenever the ayah changes.
  useEffect(() => {
    if (!current) return;
    repeatLeftRef.current = Math.max(0, (settings.repeatCount || 1) - 1);
  }, [current?.surah, current?.ayah, settings.repeatCount]);

  // Load + play whenever `current` changes
  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setError(false);
    setLoading(true);

    (async () => {
      try {
        const url = await getAyahAudioBlobUrl(current.surah, current.ayah, settings.reciterId);
        if (cancelled) {
          revokeAyahBlobUrl(url);
          return;
        }
        if (blobUrlRef.current) revokeAyahBlobUrl(blobUrlRef.current);
        blobUrlRef.current = url;

        if (!audioRef.current) audioRef.current = new Audio();
        const a = audioRef.current;
        a.src = url;
        a.volume = volume;
        a.playbackRate = settings.speed;
        a.preload = 'auto';
        try {
          await a.play();
          if (!cancelled) { setPlaying(true); setLoading(false); }
        } catch {
          if (!cancelled) { setPlaying(false); setLoading(false); }
        }
      } catch {
        if (!cancelled) { setError(true); setLoading(false); setPlaying(false); }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.surah, current?.ayah, settings.reciterId]);

  // Sync speed without reloading
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = settings.speed;
  }, [settings.speed]);

  // Wire ended → next ayah handling (with repeat / range / gap logic)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const advance = () => {
      if (!current) return;

      // 1) Repeat current ayah?
      if (repeatLeftRef.current > 0) {
        repeatLeftRef.current -= 1;
        try { a.currentTime = 0; a.play(); } catch { /* ignore */ }
        return;
      }

      // 2) Move to next ayah within surah (or first ayah of next surah)
      const meta = surahsByNumber.get(current.surah);
      let nextS = current.surah;
      let nextA = current.ayah + 1;
      if (!meta || current.ayah >= meta.numberOfAyahs) {
        if (current.surah >= 114) { onStop(); return; }
        nextS = current.surah + 1;
        nextA = 1;
      }

      // 3) Range boundary?
      if (range) {
        const past = cmp(nextS, nextA, range.endSurah, range.endAyah) > 0;
        if (past) {
          cycleRef.current += 1;
          // Infinite (0) or still cycles to go?
          // Note: range repeat is independent from per-ayah repeat — we
          // re-play the whole range exactly when autoAdvance is OFF and
          // the user requested ∞ repeats.
          if (settings.repeatCount === 0 && !settings.autoAdvance) {
            nextS = range.startSurah;
            nextA = range.startAyah;
          } else {
            onStop();
            return;
          }
        }
      } else if (!settings.autoAdvance) {
        // No range, no autoAdvance → stop after this ayah's repeats
        onStop();
        return;
      }

      const fire = () => onAyahChange?.(nextS, nextA);
      if (settings.gapMs > 0) setTimeout(fire, settings.gapMs);
      else fire();
    };

    const onErr = () => setError(true);
    a.addEventListener('ended', advance);
    a.addEventListener('error', onErr);
    return () => {
      a.removeEventListener('ended', advance);
      a.removeEventListener('error', onErr);
    };
  }, [current, surahsByNumber, onAyahChange, onStop, range, settings.gapMs, settings.autoAdvance, settings.repeatCount]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    setStoredVolume(volume);
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) { a.pause(); a.src = ''; }
      if (blobUrlRef.current) revokeAyahBlobUrl(blobUrlRef.current);
    };
  }, []);

  if (!current || !surahMeta) return null;

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try { await a.play(); setPlaying(true); } catch { /* ignore */ }
    } else {
      a.pause(); setPlaying(false);
    }
  };

  const skipPrev = () => {
    if (!current) return;
    if (current.ayah > 1) onAyahChange?.(current.surah, current.ayah - 1);
    else if (current.surah > 1) {
      const prev = surahsByNumber.get(current.surah - 1);
      if (prev) onAyahChange?.(current.surah - 1, prev.numberOfAyahs);
    }
  };

  const skipNext = () => {
    if (!current) return;
    const meta = surahsByNumber.get(current.surah);
    if (meta && current.ayah < meta.numberOfAyahs) {
      onAyahChange?.(current.surah, current.ayah + 1);
    } else if (current.surah < 114) {
      onAyahChange?.(current.surah + 1, 1);
    }
  };

  const cleanSurahName = surahMeta.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '');
  const repeatBadge =
    settings.repeatCount === 0
      ? '∞'
      : settings.repeatCount > 1
        ? `${toArabicNumerals(Math.max(1, settings.repeatCount - repeatLeftRef.current))}/${toArabicNumerals(settings.repeatCount)}`
        : null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="fixed bottom-14 inset-x-0 z-40 px-2 pointer-events-none"
      dir="rtl"
    >
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/30 shadow-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            {/* Stop */}
            <button
              onClick={onStop}
              className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
              aria-label="إيقاف التلاوة"
            >
              <X className="w-3.5 h-3.5 text-foreground/65" />
            </button>

            {/* Reciter + ayah info */}
            <div className="flex-1 min-w-0 px-1">
              <p className="text-[11px] text-foreground/85 font-medium truncate">
                {reciter.name}
              </p>
              <p className="text-[9.5px] text-muted-foreground/70 font-light truncate tabular-nums">
                {cleanSurahName} · آية {toArabicNumerals(current.ayah)}
                {settings.speed !== 1 && <span className="mr-1.5 text-foreground/55">×{settings.speed}</span>}
                {repeatBadge && (
                  <span className="mr-1.5 inline-flex items-center gap-0.5 text-foreground/65">
                    <Repeat className="w-2.5 h-2.5 inline" strokeWidth={1.8} />
                    {repeatBadge}
                  </span>
                )}
                {error && <span className="text-destructive/80 mr-1.5">— تعذّر التحميل</span>}
              </p>
            </div>

            {/* Settings (opens PlaybackPanel) */}
            {onOpenPanel && (
              <button
                onClick={onOpenPanel}
                className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
                aria-label="إعدادات التلاوة"
              >
                <Settings2 className="w-3.5 h-3.5 text-foreground/65" strokeWidth={1.6} />
              </button>
            )}

            {/* Volume */}
            <div className="relative">
              <button
                onClick={() => setShowVolume((s) => !s)}
                className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
                aria-label="مستوى الصوت"
              >
                {volume === 0
                  ? <VolumeX className="w-3.5 h-3.5 text-foreground/65" strokeWidth={1.6} />
                  : <Volume2 className="w-3.5 h-3.5 text-foreground/65" strokeWidth={1.6} />}
              </button>
              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className="absolute bottom-11 right-0 w-44 bg-popover border border-border/30 rounded-2xl shadow-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] text-muted-foreground/70 font-light">مستوى الصوت</p>
                      <p className="text-[10px] text-foreground/70 tabular-nums">{Math.round(volume * 100)}%</p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prev (RTL) */}
            <button
              onClick={skipPrev}
              className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
              aria-label="الآية السابقة"
            >
              <SkipForward className="w-3.5 h-3.5 text-foreground/70" strokeWidth={1.7} />
            </button>

            {/* Play/pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95"
              aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : playing
                  ? <Pause className="w-4 h-4" fill="currentColor" />
                  : <Play className="w-4 h-4" fill="currentColor" />}
            </button>

            {/* Next */}
            <button
              onClick={skipNext}
              className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95"
              aria-label="الآية التالية"
            >
              <SkipBack className="w-3.5 h-3.5 text-foreground/70" strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuranAudioBar;
