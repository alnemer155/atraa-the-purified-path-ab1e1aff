import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle, BookOpen, Check } from 'lucide-react';
import {
  TAFSIRS,
  fetchAyahTafsir,
  getPreferredTafsir,
  setPreferredTafsir,
  type TafsirId,
} from '@/lib/quran-tafsir';
import { toArabicNumerals } from '@/lib/quran-page';

interface Props {
  open: boolean;
  surah: number;
  ayah: number;
  surahName: string;
  onClose: () => void;
}

/**
 * Bottom-sheet showing the tafsir of a single ayah. The user can switch
 * between four classical tafsirs; the choice is persisted.
 */
const TafsirSheet = ({ open, surah, ayah, surahName, onClose }: Props) => {
  const [tafsirId, setTafsirId] = useState<TafsirId>(() => getPreferredTafsir());
  const [picker, setPicker] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setText(null);
    fetchAyahTafsir(tafsirId, surah, ayah)
      .then(t => { if (!cancelled) setText(t); })
      .catch(() => { if (!cancelled) setError('فشل تحميل التفسير'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, tafsirId, surah, ayah]);

  const current = TAFSIRS.find(t => t.id === tafsirId)!;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[75] bg-black/55 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="w-full max-w-md bg-card rounded-t-3xl border-t border-border/30 shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-9 h-1 rounded-full bg-border/60 mt-3 mb-2 shrink-0" />

            <div className="px-5 pt-1 pb-3 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <p className="surah-name-display text-[15px] text-foreground leading-tight truncate">
                  {surahName}
                </p>
                <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 tabular-nums">
                  الآية {toArabicNumerals(ayah)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center active:scale-95 shrink-0"
                aria-label="إغلاق"
              >
                <X className="w-3.5 h-3.5 text-foreground/60" />
              </button>
            </div>

            {/* Tafsir picker pill */}
            <div className="px-5 pb-3 shrink-0">
              <button
                onClick={() => setPicker(p => !p)}
                className="w-full h-10 rounded-2xl bg-secondary/40 active:bg-secondary/60 flex items-center justify-between px-4 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-foreground/60" strokeWidth={1.6} />
                  <span className="text-[12px] text-foreground/85">{current.name}</span>
                </div>
                <span className="text-[9px] text-muted-foreground/60 font-light">
                  {picker ? 'إخفاء' : 'تغيير'}
                </span>
              </button>

              <AnimatePresence>
                {picker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-1.5 mt-2">
                      {TAFSIRS.map(t => {
                        const active = t.id === tafsirId;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTafsirId(t.id);
                              setPreferredTafsir(t.id);
                              setPicker(false);
                            }}
                            className={`w-full text-right px-3.5 py-2.5 rounded-xl border transition-colors ${
                              active
                                ? 'bg-foreground/5 border-foreground/40'
                                : 'bg-card border-border/30 active:bg-secondary/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-[12px] text-foreground/90">{t.name}</p>
                                <p className="text-[9px] text-muted-foreground/60 font-light mt-0.5 truncate">
                                  {t.author}
                                </p>
                              </div>
                              {active && <Check className="w-3.5 h-3.5 text-foreground/70 shrink-0" strokeWidth={2} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tafsir body */}
            <div className="flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {loading && (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <Loader2 className="w-4 h-4 text-muted-foreground/40 animate-spin" />
                  <p className="text-[10px] text-muted-foreground/60 font-light">جارٍ تحميل التفسير…</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-10 px-4">
                  <AlertTriangle className="w-5 h-5 text-foreground/40 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[11px] text-foreground/70 mb-3">{error}</p>
                  <button
                    onClick={() => setTafsirId(t => t)}
                    className="px-4 py-2 rounded-full bg-secondary/40 text-[11px] text-foreground/80 active:scale-95"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {text && !loading && (
                <div className="pb-4">
                  <p
                    className="text-[14px] text-foreground/90 leading-[2.1] font-light"
                    style={{ textAlign: 'justify' }}
                  >
                    {text}
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 font-light mt-5 text-center leading-relaxed">
                    {current.name} — {current.author}
                    <br />
                    المصدر: مستودع spa5k/tafsir_api · للتعليم فقط
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TafsirSheet;
