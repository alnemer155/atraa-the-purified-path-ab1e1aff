/**
 * Floating mini-player shown beneath the app header while a Qasida is loaded.
 * Allows pause/play, skip prev/next, and quick close. Stays mounted across
 * route changes so audio continues uninterrupted.
 */
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { useQasaidPlayer, qasaidPublicUrl } from '@/contexts/QasaidPlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingQasaidBar = () => {
  const { current, isPlaying, toggle, next, prev, stop, position, duration } = useQasaidPlayer();
  if (!current) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const cover = current.cover_path ? qasaidPublicUrl(current.cover_path) : '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="sticky top-0 z-40 mx-2 mt-1 rounded-2xl border border-border/30 bg-card/95 backdrop-blur-xl shadow-card overflow-hidden"
        dir="rtl"
      >
        <div className="flex items-center gap-2 p-2">
          {cover ? (
            <img src={cover} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Play className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-foreground truncate">{current.title}</p>
            <p className="text-[9px] text-muted-foreground/70 font-light truncate mt-0.5">{current.reciter}</p>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={prev} aria-label="السابق" className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/50">
              <SkipForward className="w-3.5 h-3.5 text-foreground" strokeWidth={1.6} />
            </button>
            <button onClick={toggle} aria-label={isPlaying ? 'إيقاف' : 'تشغيل'} className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center">
              {isPlaying ? <Pause className="w-3.5 h-3.5" strokeWidth={2} /> : <Play className="w-3.5 h-3.5 ms-0.5" strokeWidth={2} />}
            </button>
            <button onClick={next} aria-label="التالي" className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/50">
              <SkipBack className="w-3.5 h-3.5 text-foreground" strokeWidth={1.6} />
            </button>
            <button onClick={stop} aria-label="إغلاق" className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/50">
              <X className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
            </button>
          </div>
        </div>
        <div className="h-[2px] bg-border/30">
          <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingQasaidBar;
