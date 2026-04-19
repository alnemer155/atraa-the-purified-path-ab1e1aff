import { ChevronLeft, ChevronRight, ArrowRight, Minus, Plus } from 'lucide-react';
import { useHideChrome } from '@/contexts/UIContext';
import type { DuaItem } from '@/lib/duas-parser';

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
 * Immersive reader view — hides the global AppHeader and bottom nav so
 * only the dua content is visible (per v2.6.88 spec).
 */
const DuaReader = ({ item, filtered, fontSize, setFontSize, onClose, onSelect }: DuaReaderProps) => {
  useHideChrome({ header: true, bottomNav: true });

  const currentIndex = filtered.findIndex(i => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < filtered.length - 1;

  return (
    <div className="animate-fade-in min-h-screen flex flex-col bg-background">
      {/* Minimal floating header — only "back" + font controls */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-2xl px-4 py-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-foreground text-[13px] active:scale-95 transition-transform"
            aria-label="back"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="font-light">رجوع</span>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="w-9 h-9 rounded-full bg-secondary/40 text-foreground flex items-center justify-center active:scale-90 transition-transform"
              aria-label="decrease font"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <button
              onClick={() => setFontSize(s => Math.min(32, s + 2))}
              className="w-9 h-9 rounded-full bg-secondary/40 text-foreground flex items-center justify-center active:scale-90 transition-transform"
              aria-label="increase font"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Reader body */}
      <div className="flex-1 px-5 py-6 pb-28">
        <div className="mb-6">
          <span className="text-[9px] text-primary/60 tracking-wider font-light">
            {CATEGORY_LABELS[item.category]}
          </span>
          <h1 className="text-xl text-foreground leading-snug tracking-tight mt-1">{item.title}</h1>
          <p className="text-[9px] text-muted-foreground/40 mt-1.5 font-light">المصدر: حقيبة المؤمن</p>
        </div>
        <div
          className="bg-card rounded-3xl p-6 border border-border/15 text-foreground whitespace-pre-wrap religious-text leading-[2.4]"
          style={{ fontSize: `${fontSize}px`, fontWeight: 400 }}
        >
          {item.content}
        </div>
      </div>

      {/* Floating nav — fixed at bottom (since BottomNav is hidden) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg md:max-w-2xl px-5 py-3 flex items-center justify-between bg-background/85 backdrop-blur-2xl border-t border-border/10 safe-bottom">
        <button
          onClick={() => hasNext && onSelect(filtered[currentIndex + 1])}
          disabled={!hasNext}
          className="flex items-center gap-1 text-[12px] text-foreground disabled:opacity-20 active:scale-95 transition-transform"
        >
          التالي <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {currentIndex + 1} / {filtered.length}
        </span>
        <button
          onClick={() => hasPrev && onSelect(filtered[currentIndex - 1])}
          disabled={!hasPrev}
          className="flex items-center gap-1 text-[12px] text-foreground disabled:opacity-20 active:scale-95 transition-transform"
        >
          <ChevronRight className="w-3.5 h-3.5" /> السابق
        </button>
      </div>
    </div>
  );
};

export default DuaReader;
