import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Mic, Repeat, Gauge, Timer, Play } from 'lucide-react';
import { RECITERS, setStoredReciterId } from '@/lib/quran-reciters';
import {
  type PlaybackSettings,
  type PlaybackRange,
  REPEAT_OPTIONS,
  SPEED_OPTIONS,
  GAP_OPTIONS,
  setPlaybackSettings,
} from '@/lib/quran-playback';
import { toArabicNumerals } from '@/lib/quran-page';

interface SurahMeta { number: number; name: string; numberOfAyahs: number; }

interface Props {
  open: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  onSettingsChange: (s: PlaybackSettings) => void;
  /** Currently-loaded page surahs (used to populate range default values) */
  pageSurahs: SurahMeta[];
  surahsByNumber: Map<number, SurahMeta>;
  /** Triggered when the user taps "ابدأ التلاوة" with a specific range. */
  onStart: (range: PlaybackRange) => void;
}

const cleanName = (n: string) =>
  n.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '');

/**
 * Bottom-sheet "playback configuration" panel. Lets the listener pick
 * reciter, ayah range, repeat count, speed, and inter-ayah gap, then
 * starts the recitation. Self-contained: writes settings to localStorage
 * and notifies parent via callbacks.
 */
const PlaybackPanel = ({
  open,
  onClose,
  settings,
  onSettingsChange,
  pageSurahs,
  surahsByNumber,
  onStart,
}: Props) => {
  // Range — defaults to the first surah on the current page, ayah 1 → last
  const initialSurah = pageSurahs[0]?.number ?? 1;
  const initialEndAyah =
    pageSurahs[0]?.numberOfAyahs ?? surahsByNumber.get(initialSurah)?.numberOfAyahs ?? 7;

  const [startSurah, setStartSurah] = useState(initialSurah);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(initialSurah);
  const [endAyah, setEndAyah] = useState(initialEndAyah);

  // Re-sync defaults when the page changes
  useEffect(() => {
    if (!open) return;
    const s = pageSurahs[0]?.number ?? 1;
    const lastAyah = pageSurahs[0]?.numberOfAyahs ?? 7;
    setStartSurah(s);
    setStartAyah(1);
    setEndSurah(s);
    setEndAyah(lastAyah);
  }, [open, pageSurahs]);

  const startSurahMeta = surahsByNumber.get(startSurah);
  const endSurahMeta = surahsByNumber.get(endSurah);

  const startAyahOptions = useMemo(
    () => Array.from({ length: startSurahMeta?.numberOfAyahs ?? 1 }, (_, i) => i + 1),
    [startSurahMeta],
  );
  const endAyahOptions = useMemo(
    () => Array.from({ length: endSurahMeta?.numberOfAyahs ?? 1 }, (_, i) => i + 1),
    [endSurahMeta],
  );

  // Normalise range when surah selection breaks ordering
  useEffect(() => {
    if (endSurah < startSurah) {
      setEndSurah(startSurah);
      setEndAyah(startSurahMeta?.numberOfAyahs ?? 1);
    }
    if (endSurah === startSurah && endAyah < startAyah) {
      setEndAyah(startAyah);
    }
    if (endAyah > (endSurahMeta?.numberOfAyahs ?? 1)) {
      setEndAyah(endSurahMeta?.numberOfAyahs ?? 1);
    }
  }, [startSurah, startAyah, endSurah, endAyah, startSurahMeta, endSurahMeta]);

  const update = (patch: Partial<PlaybackSettings>) => {
    const next = { ...settings, ...patch };
    setPlaybackSettings(next);
    if (patch.reciterId) setStoredReciterId(patch.reciterId);
    onSettingsChange(next);
  };

  const handleStart = () => {
    onStart({ startSurah, startAyah, endSurah, endAyah });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-3 pb-3 sm:pb-0"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full max-w-md bg-card rounded-3xl border border-border/20 shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/10">
              <p className="text-[13px] text-foreground font-medium">إعدادات التلاوة</p>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center active:scale-95"
                aria-label="إغلاق"
              >
                <X className="w-3.5 h-3.5 text-foreground/60" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-5 hide-scrollbar">
              {/* Reciter */}
              <section>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Mic className="w-3 h-3 text-muted-foreground/70" strokeWidth={1.7} />
                  <p className="text-[11px] text-muted-foreground/80 font-light">القارئ</p>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto hide-scrollbar pr-0.5">
                  {RECITERS.map(r => {
                    const sel = r.id === settings.reciterId;
                    return (
                      <button
                        key={r.id}
                        onClick={() => update({ reciterId: r.id })}
                        className={`w-full px-3 py-2 rounded-2xl flex items-center justify-between gap-2 transition-colors active:scale-[0.99] ${
                          sel ? 'bg-primary/10 border border-primary/40' : 'bg-secondary/30 border border-transparent'
                        }`}
                      >
                        <div className="text-right flex-1 min-w-0">
                          <p className="text-[12px] text-foreground font-medium truncate">{r.name}</p>
                          <p className="text-[9.5px] text-muted-foreground/65 font-light truncate mt-0.5">{r.hint}</p>
                        </div>
                        {sel && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Range */}
              <section>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] text-muted-foreground/80 font-light">نطاق التلاوة</p>
                </div>

                {/* From */}
                <div className="rounded-2xl bg-secondary/30 border border-border/15 p-3 mb-2">
                  <p className="text-[10px] text-muted-foreground/65 font-light mb-2">من</p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={startSurah}
                      onChange={e => { const v = parseInt(e.target.value, 10); setStartSurah(v); setStartAyah(1); }}
                      className="h-9 rounded-xl bg-background border border-border/20 text-[11px] text-foreground px-2 outline-none focus:border-primary/40"
                    >
                      {Array.from(surahsByNumber.values()).map(s => (
                        <option key={s.number} value={s.number}>
                          {toArabicNumerals(s.number)}. {cleanName(s.name)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={startAyah}
                      onChange={e => setStartAyah(parseInt(e.target.value, 10))}
                      className="h-9 rounded-xl bg-background border border-border/20 text-[11px] text-foreground px-2 outline-none focus:border-primary/40 tabular-nums"
                    >
                      {startAyahOptions.map(n => (
                        <option key={n} value={n}>آية {toArabicNumerals(n)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* To */}
                <div className="rounded-2xl bg-secondary/30 border border-border/15 p-3">
                  <p className="text-[10px] text-muted-foreground/65 font-light mb-2">إلى</p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={endSurah}
                      onChange={e => { const v = parseInt(e.target.value, 10); setEndSurah(v); }}
                      className="h-9 rounded-xl bg-background border border-border/20 text-[11px] text-foreground px-2 outline-none focus:border-primary/40"
                    >
                      {Array.from(surahsByNumber.values())
                        .filter(s => s.number >= startSurah)
                        .map(s => (
                          <option key={s.number} value={s.number}>
                            {toArabicNumerals(s.number)}. {cleanName(s.name)}
                          </option>
                        ))}
                    </select>
                    <select
                      value={endAyah}
                      onChange={e => setEndAyah(parseInt(e.target.value, 10))}
                      className="h-9 rounded-xl bg-background border border-border/20 text-[11px] text-foreground px-2 outline-none focus:border-primary/40 tabular-nums"
                    >
                      {endAyahOptions
                        .filter(n => endSurah !== startSurah || n >= startAyah)
                        .map(n => (
                          <option key={n} value={n}>آية {toArabicNumerals(n)}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Repeat */}
              <section>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Repeat className="w-3 h-3 text-muted-foreground/70" strokeWidth={1.7} />
                  <p className="text-[11px] text-muted-foreground/80 font-light">التكرار</p>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {REPEAT_OPTIONS.map(o => {
                    const sel = settings.repeatCount === o.value;
                    return (
                      <button
                        key={o.value}
                        onClick={() => update({ repeatCount: o.value })}
                        className={`h-9 rounded-xl text-[11px] tabular-nums transition-colors active:scale-95 ${
                          sel ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/70'
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Gap between ayahs */}
              <section>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Timer className="w-3 h-3 text-muted-foreground/70" strokeWidth={1.7} />
                  <p className="text-[11px] text-muted-foreground/80 font-light">فاصل بين الآيات</p>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {GAP_OPTIONS.map(o => {
                    const sel = settings.gapMs === o.value;
                    return (
                      <button
                        key={o.value}
                        onClick={() => update({ gapMs: o.value })}
                        className={`h-9 rounded-xl text-[11px] tabular-nums transition-colors active:scale-95 ${
                          sel ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/70'
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Speed */}
              <section>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Gauge className="w-3 h-3 text-muted-foreground/70" strokeWidth={1.7} />
                  <p className="text-[11px] text-muted-foreground/80 font-light">سرعة التلاوة</p>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {SPEED_OPTIONS.map(v => {
                    const sel = settings.speed === v;
                    return (
                      <button
                        key={v}
                        onClick={() => update({ speed: v })}
                        className={`h-9 rounded-xl text-[11px] tabular-nums transition-colors active:scale-95 ${
                          sel ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/70'
                        }`}
                      >
                        ×{v}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Auto advance */}
              <section className="flex items-center justify-between rounded-2xl bg-secondary/30 border border-border/15 px-3 py-2.5">
                <div className="text-right">
                  <p className="text-[12px] text-foreground font-medium">المتابعة التلقائية</p>
                  <p className="text-[9.5px] text-muted-foreground/65 font-light mt-0.5">
                    الانتقال تلقائياً للآية التالية بعد التكرارات
                  </p>
                </div>
                <button
                  onClick={() => update({ autoAdvance: !settings.autoAdvance })}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    settings.autoAdvance ? 'bg-primary' : 'bg-secondary'
                  }`}
                  aria-label="المتابعة التلقائية"
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all ${
                      settings.autoAdvance ? 'right-0.5' : 'right-[22px]'
                    }`}
                  />
                </button>
              </section>
            </div>

            {/* Action */}
            <div className="px-5 py-3.5 border-t border-border/10 bg-background/50">
              <button
                onClick={handleStart}
                className="w-full h-11 rounded-2xl bg-primary text-primary-foreground text-[13px] font-medium flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5" fill="currentColor" />
                <span>ابدأ التلاوة</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaybackPanel;
