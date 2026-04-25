import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DuaItem } from '@/lib/duas-parser';
import SmartText from '@/components/SmartText';

const CATEGORY_LABELS: Record<string, string> = { dua: 'الأدعية', ziyara: 'الزيارات', dhikr: 'الأذكار' };

interface DuaReaderProps {
  item: DuaItem;
  filtered: DuaItem[];
  fontSize: number;
  setFontSize: (fn: (s: number) => number) => void;
  onClose: () => void;
  onSelect: (item: DuaItem) => void;
}

/**
 * Immersive reader view — full-screen overlay (matches Quran reader pattern).
 * Covers AppHeader, Library tabs and BottomNav for distraction-free reading.
 * The internal floating switcher provides prev/next navigation.
 */
const DuaReader = ({ item, filtered, fontSize, setFontSize, onClose, onSelect }: DuaReaderProps) => {
  const [showFontMenu, setShowFontMenu] = useState(false);

  const currentIndex = filtered.findIndex(i => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < filtered.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
      dir="rtl"
    >
      {/* Reader body — back button + font menu live as small floating chips */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        {/* Top floating chips (back + font size) */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-foreground text-[12px] active:scale-95 transition-transform px-3 py-1.5 rounded-full bg-secondary/40 border border-border/20"
            aria-label="back"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="font-light">رجوع</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFontMenu(v => !v)}
              className="w-9 h-9 rounded-full bg-secondary/40 border border-border/20 text-foreground flex items-center justify-center active:scale-90 transition-transform"
              aria-label="font size"
            >
              <Type className="w-3.5 h-3.5" strokeWidth={1.6} />
            </button>
            <AnimatePresence>
              {showFontMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 right-0 bg-card border border-border/30 rounded-2xl shadow-elevated p-1.5 flex items-center gap-1 z-20"
                >
                  <button
                    onClick={() => setFontSize(s => Math.max(14, s - 2))}
                    className="w-8 h-8 rounded-xl bg-secondary/40 text-foreground text-[14px] active:scale-90 transition-transform"
                  >−</button>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-center">{fontSize}</span>
                  <button
                    onClick={() => setFontSize(s => Math.min(32, s + 2))}
                    className="w-8 h-8 rounded-xl bg-secondary/40 text-foreground text-[14px] active:scale-90 transition-transform"
                  >+</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <span className="text-[9px] text-primary/60 tracking-wider font-light">
            {CATEGORY_LABELS[item.category]}
          </span>
          <SmartText as="div" className="text-xl text-foreground leading-snug tracking-tight mt-1 block" iconSize={16}>{item.title}</SmartText>
          <p className="text-[9px] text-muted-foreground/40 mt-1.5 font-light">المصدر: حقيبة المؤمن</p>
        </div>

        {/* Body */}
        <div
          className="bg-card rounded-3xl p-6 border border-border/15 text-foreground whitespace-pre-wrap religious-text leading-[2.4]"
          style={{ fontSize: `${fontSize}px`, fontWeight: 400 }}
        >
          {item.content}
        </div>
      </div>

      {/* Floating prev/next switcher — pinned just above BottomNav */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-full max-w-lg md:max-w-2xl px-4 z-40 pointer-events-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className="pointer-events-auto mx-2 flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-card/85 backdrop-blur-2xl border border-border/30 shadow-elevated">
          <button
            onClick={() => hasNext && onSelect(filtered[currentIndex + 1])}
            disabled={!hasNext}
            className="flex items-center gap-1 text-[11px] text-foreground disabled:opacity-25 active:scale-95 transition-transform px-2 py-1"
          >
            التالي <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground/60 tabular-nums">
            {currentIndex + 1} / {filtered.length}
          </span>
          <button
            onClick={() => hasPrev && onSelect(filtered[currentIndex - 1])}
            disabled={!hasPrev}
            className="flex items-center gap-1 text-[11px] text-foreground disabled:opacity-25 active:scale-95 transition-transform px-2 py-1"
          >
            <ChevronRight className="w-3.5 h-3.5" /> السابق
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DuaReader;
