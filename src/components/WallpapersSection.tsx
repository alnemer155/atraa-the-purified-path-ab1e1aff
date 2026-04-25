import { useState, useEffect } from 'react';
import { Download, Check, Heart, ThumbsDown, X, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react';
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
import wpNew1 from '@/assets/wallpapers/wp-new-1.jpeg';
import wpNew2 from '@/assets/wallpapers/wp-new-2.jpeg';
import wpNew3 from '@/assets/wallpapers/wp-new-3.jpeg';
import wpNew4 from '@/assets/wallpapers/wp-new-4.jpeg';
import wpNew5 from '@/assets/wallpapers/wp-new-5.jpeg';
import wpNew6 from '@/assets/wallpapers/wp-new-6.jpeg';
import wpNew7 from '@/assets/wallpapers/wp-new-7.jpeg';
import wpNew8 from '@/assets/wallpapers/wp-new-8.jpeg';
import wpNew9 from '@/assets/wallpapers/wp-new-9.jpeg';

const wallpapers = [
  // New verified wallpapers (Round 2)
  { id: 'n1', src: wpNew1, name: 'الصلاة على النبي (ص) — الأحزاب 56' },
  { id: 'n2', src: wpNew2, name: 'من ساعى الأيام عاثرته — الإمام علي (ع)' },
  { id: 'n3', src: wpNew3, name: 'الدنيا دار مجاز والآخرة دار قرار — الإمام علي (ع)' },
  { id: 'n4', src: wpNew4, name: 'لا يرجون أحد إلا ربه — الإمام علي (ع)' },
  { id: 'n5', src: wpNew5, name: 'الاعتدال في المشاعر — الإمام علي (ع)' },
  { id: 'n6', src: wpNew6, name: 'أنا الذي سمتني أمي حيدرة — الإمام علي (ع)' },
  { id: 'n7', src: wpNew7, name: 'أنا أهل بيت النبوة — الإمام الحسين (ع)' },
  { id: 'n8', src: wpNew8, name: 'هيهات منا الذلة — الإمام الحسين (ع)' },
  { id: 'n9', src: wpNew9, name: 'هل من ناصر ينصرني — الإمام الحسين (ع)' },
  // Original wallpapers
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

const PREVIEW_COUNT = 6;

const WallpapersSection = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState<Set<number>>(new Set());
  const [selectedWallpaper, setSelectedWallpaper] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [reactions, setReactions] = useState<Record<string, Reaction>>(() => {
    try {
      return JSON.parse(localStorage.getItem('atraa_wallpaper_reactions') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('atraa_wallpaper_reactions', JSON.stringify(reactions));
  }, [reactions]);

  // Lock body scroll when fullscreen viewer is open
  useEffect(() => {
    if (selectedWallpaper !== null) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [selectedWallpaper]);

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
      a.download = `atraa-${name}.jpg`;
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
            transition={{ delay: Math.min(i * 0.015, 0.2) }}
            onClick={() => setSelectedWallpaper(i)}
            className="relative flex-shrink-0 w-[68px] rounded-xl overflow-hidden aspect-[9/16] bg-secondary/15 border border-border/10 active:scale-95 transition-transform"
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

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {selectedWallpaper !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
            dir="ltr"
          >
            {/* Image area — large, centered, fills available space */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <motion.img
                key={wallpapers[selectedWallpaper].id}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                src={wallpapers[selectedWallpaper].src}
                alt={wallpapers[selectedWallpaper].name}
                className="max-h-full max-w-full w-auto h-auto object-contain"
                style={{ aspectRatio: '9 / 16' }}
              />

              {/* Top overlay — close + ratio badge */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <button
                  onClick={() => setSelectedWallpaper(null)}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <span className="pointer-events-auto px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] text-white/90 font-light tabular-nums">
                  9:16
                </span>
              </div>

              {/* Bottom overlay — title + reactions + download (BUTTONS ON IMAGE) */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pt-10 pb-6 bg-gradient-to-t from-black/85 via-black/50 to-transparent" dir={isAr ? 'rtl' : 'ltr'}>
                <p className="text-[12px] text-white/90 text-center mb-4 font-light leading-relaxed px-2">
                  {wallpapers[selectedWallpaper].name}
                </p>

                <div className="flex items-center justify-center gap-2.5 mb-3">
                  {/* Like */}
                  <button
                    onClick={() => setReaction(wallpapers[selectedWallpaper].id, 'like')}
                    className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
                      reactions[wallpapers[selectedWallpaper].id] === 'like'
                        ? 'bg-white text-black'
                        : 'bg-white/15 text-white'
                    }`}
                    aria-label="like"
                  >
                    <Heart className={`w-[18px] h-[18px] ${reactions[wallpapers[selectedWallpaper].id] === 'like' ? 'fill-black' : ''}`} />
                  </button>

                  {/* Download (primary) */}
                  <button
                    onClick={() => handleDownload(wallpapers[selectedWallpaper].src, wallpapers[selectedWallpaper].name, selectedWallpaper)}
                    className="flex-1 max-w-[200px] h-11 rounded-full bg-white text-black text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
                  >
                    {downloading === selectedWallpaper ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    ) : downloaded.has(selectedWallpaper) ? (
                      <><Check className="w-4 h-4" /> {isAr ? 'تم التحميل' : 'Downloaded'}</>
                    ) : (
                      <><Download className="w-4 h-4" /> {isAr ? 'تحميل' : 'Download'}</>
                    )}
                  </button>

                  {/* Dislike */}
                  <button
                    onClick={() => setReaction(wallpapers[selectedWallpaper].id, 'dislike')}
                    className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
                      reactions[wallpapers[selectedWallpaper].id] === 'dislike'
                        ? 'bg-white text-black'
                        : 'bg-white/15 text-white'
                    }`}
                    aria-label="dislike"
                  >
                    <ThumbsDown className="w-[18px] h-[18px]" />
                  </button>
                </div>

                <p className="text-[9px] text-white/55 text-center font-light">
                  {isAr ? 'مقاس 9:16 — مناسب لشاشة الهاتف' : 'Aspect ratio 9:16 — fits phone screens'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WallpapersSection;
