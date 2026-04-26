import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Play } from 'lucide-react';
import { AYAH_COLOR_ORDER, AYAH_COLOR_TOKENS, type AyahColor } from '@/lib/quran-bookmarks';
import { toArabicNumerals } from '@/lib/quran-page';

interface Props {
  open: boolean;
  surah: number;
  ayah: number;
  surahName: string;
  currentColor: AyahColor | null;
  onPick: (color: AyahColor) => void;
  onClear: () => void;
  onPlay: () => void;
  onClose: () => void;
}

/**
 * Bottom-sheet shown when the user taps an ayah-number medallion.
 * Lets them assign a personal highlight color, clear it, or play its
 * recitation by Sheikh Abdulbasit.
 */
const AyahColorPicker = ({
  open,
  surah,
  ayah,
  surahName,
  currentColor,
  onPick,
  onClear,
  onPlay,
  onClose,
}: Props) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full max-w-md bg-card rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-border/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-9 h-1 rounded-full bg-border/60 mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="surah-name-display text-[15px] text-foreground leading-tight">
                  {surahName}
                </p>
                <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 tabular-nums">
                  الآية {toArabicNumerals(ayah)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center active:scale-95"
                aria-label="إغلاق"
              >
                <X className="w-3.5 h-3.5 text-foreground/60" />
              </button>
            </div>

            <p className="text-[10.5px] text-muted-foreground/70 font-light mb-2">فاصلة ملوّنة</p>
            <div className="grid grid-cols-4 gap-2.5 mb-4">
              {AYAH_COLOR_ORDER.map((c) => {
                const t = AYAH_COLOR_TOKENS[c];
                const active = currentColor === c;
                return (
                  <button
                    key={c}
                    onClick={() => onPick(c)}
                    className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border ${
                      active ? 'border-foreground/80 ring-2 ring-foreground/15' : 'border-border/30'
                    }`}
                    style={{ background: `hsl(${t.bg} / 0.14)` }}
                    aria-pressed={active}
                  >
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{
                        background: `hsl(${t.bg})`,
                        boxShadow: `0 0 0 2px hsl(var(--card)), 0 0 0 3px hsl(${t.ring} / 0.5)`,
                      }}
                    />
                    <span className="text-[9.5px] text-foreground/75 font-light">{t.labelAr}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onPlay}
                className="h-11 rounded-2xl bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Play className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
                <span>تلاوة الآية</span>
              </button>
              <button
                onClick={onClear}
                disabled={!currentColor}
                className="h-11 rounded-2xl bg-secondary/40 text-foreground/75 text-[12px] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>إزالة الفاصلة</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AyahColorPicker;
