import { useState, useEffect } from 'react';
import { Download, Check, Heart, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import wallpaper1 from '@/assets/wallpapers/wallpaper-1.png';
import wallpaper2 from '@/assets/wallpapers/wallpaper-2.png';
import wallpaper3 from '@/assets/wallpapers/wallpaper-3.png';
import wallpaper4 from '@/assets/wallpapers/wallpaper-4.png';
import wallpaper5 from '@/assets/wallpapers/wallpaper-5.png';
import wallpaper6 from '@/assets/wallpapers/wallpaper-6.png';
import wallpaper7 from '@/assets/wallpapers/wallpaper-7.png';
import wallpaper8 from '@/assets/wallpapers/wallpaper-8.png';

const wallpapers = [
  { id: 'w1', src: wallpaper1, name: 'قول الإمام علي (ع)' },
  { id: 'w2', src: wallpaper2, name: 'الحمد لله رب العالمين' },
  { id: 'w3', src: wallpaper3, name: 'الشهادة' },
  { id: 'w4', src: wallpaper4, name: 'الصلوات' },
  { id: 'w5', src: wallpaper5, name: 'يا حبيبي حسين' },
  { id: 'w6', src: wallpaper6, name: 'وداع شهر البر والإحسان' },
  { id: 'w7', src: wallpaper7, name: 'وداع شهر الطاعة والغفران' },
  { id: 'w8', src: wallpaper8, name: 'الوداع' },
];

type Reaction = 'like' | 'dislike' | null;

const WallpapersSection = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState<Set<number>>(new Set());
  const [selectedWallpaper, setSelectedWallpaper] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<string, Reaction>>(() => {
    try {
      return JSON.parse(localStorage.getItem('atraa_wallpaper_reactions') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('atraa_wallpaper_reactions', JSON.stringify(reactions));
  }, [reactions]);

  const setReaction = (id: string, r: Reaction) => {
    setReactions(prev => ({ ...prev, [id]: prev[id] === r ? null : r }));
  };

  const handleDownload = async (src: string, name: string, idx: number) => {
    setDownloading(idx);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atraa-${name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(prev => new Set(prev).add(idx));
    } catch { /* ignore */ }
    setTimeout(() => setDownloading(null), 500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className={`text-[12px] text-foreground ${isAr ? 'text-right' : 'text-left'}`}>
          {isAr ? 'خلفيات عِتَرَةً' : 'Wallpapers'}
        </h2>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {wallpapers.length} · 9:16
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1.5 -mx-4 px-4">
        {wallpapers.map((w, i) => (
          <motion.button
            key={w.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => setSelectedWallpaper(i)}
            className="relative flex-shrink-0 w-[64px] rounded-xl overflow-hidden aspect-[9/16] bg-secondary/15 border border-border/10 active:scale-95 transition-transform"
          >
            <img src={w.src} alt={w.name} className="w-full h-full object-cover" loading="lazy" />
            {downloaded.has(i) && (
              <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-foreground flex items-center justify-center">
                <Check className="w-1.5 h-1.5 text-background" />
              </div>
            )}
            {reactions[w.id] === 'like' && (
              <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-foreground flex items-center justify-center">
                <Heart className="w-1.5 h-1.5 text-background fill-background" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedWallpaper !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-md px-8"
            onClick={() => setSelectedWallpaper(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative max-w-[220px] w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={wallpapers[selectedWallpaper].src}
                  alt={wallpapers[selectedWallpaper].name}
                  className="w-full rounded-2xl aspect-[9/16] object-cover"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-background/85 backdrop-blur-sm text-[8px] text-foreground/70 font-light tabular-nums">
                  9:16
                </span>
              </div>

              <p className="text-[10px] text-background/80 text-center mt-2.5 mb-2 font-light">
                {wallpapers[selectedWallpaper].name}
              </p>

              {/* Reactions */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <button
                  onClick={() => setReaction(wallpapers[selectedWallpaper].id, 'like')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors active:scale-95 ${
                    reactions[wallpapers[selectedWallpaper].id] === 'like'
                      ? 'bg-background text-foreground'
                      : 'bg-background/30 text-background'
                  }`}
                  aria-label="like"
                >
                  <Heart className={`w-4 h-4 ${reactions[wallpapers[selectedWallpaper].id] === 'like' ? 'fill-foreground' : ''}`} />
                </button>
                <button
                  onClick={() => setReaction(wallpapers[selectedWallpaper].id, 'dislike')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors active:scale-95 ${
                    reactions[wallpapers[selectedWallpaper].id] === 'dislike'
                      ? 'bg-background text-foreground'
                      : 'bg-background/30 text-background'
                  }`}
                  aria-label="dislike"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleDownload(wallpapers[selectedWallpaper].src, wallpapers[selectedWallpaper].name, selectedWallpaper)}
                className="w-full py-2 rounded-xl bg-background/90 backdrop-blur-sm text-foreground text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                {downloading === selectedWallpaper ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full" />
                ) : downloaded.has(selectedWallpaper) ? (
                  <><Check className="w-3 h-3" /> {isAr ? 'تم التحميل' : 'Downloaded'}</>
                ) : (
                  <><Download className="w-3 h-3" /> {isAr ? 'تحميل (9:16)' : 'Download (9:16)'}</>
                )}
              </button>
              <p className="text-[8px] text-background/50 text-center mt-1.5 font-light">
                {isAr ? 'مقاس الصورة 9:16 — مناسب لشاشة الهاتف' : 'Image size is 9:16 — fits phone screens'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WallpapersSection;
