import { useState } from 'react';
import { Download, ImageIcon, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import wallpaper1 from '@/assets/wallpapers/wallpaper-1.png';
import wallpaper2 from '@/assets/wallpapers/wallpaper-2.png';
import wallpaper3 from '@/assets/wallpapers/wallpaper-3.png';
import wallpaper4 from '@/assets/wallpapers/wallpaper-4.png';
import wallpaper5 from '@/assets/wallpapers/wallpaper-5.png';
import wallpaper6 from '@/assets/wallpapers/wallpaper-6.png';
import wallpaper7 from '@/assets/wallpapers/wallpaper-7.png';
import wallpaper8 from '@/assets/wallpapers/wallpaper-8.png';

const wallpapers = [
  { src: wallpaper1, name: 'قول الإمام علي (ع)' },
  { src: wallpaper2, name: 'الحمد لله رب العالمين' },
  { src: wallpaper3, name: 'الشهادة' },
  { src: wallpaper4, name: 'الصلوات' },
  { src: wallpaper5, name: 'يا حبيبي حسين' },
  { src: wallpaper6, name: 'وداع شهر البر والإحسان' },
  { src: wallpaper7, name: 'وداع شهر الطاعة والغفران' },
  { src: wallpaper8, name: 'الوداع' },
];

const WallpapersSection = () => {
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState<Set<number>>(new Set());
  const [selectedWallpaper, setSelectedWallpaper] = useState<number | null>(null);

  const handleDownload = async (src: string, name: string, idx: number) => {
    setDownloading(idx);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `عترة-${name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(prev => new Set(prev).add(idx));
    } catch {}
    setTimeout(() => setDownloading(null), 500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-accent-foreground" />
          </div>
          <h2 className="text-[13px] font-bold text-foreground">خلفيات عِتَرَةً</h2>
        </div>
        <span className="text-[9px] text-muted-foreground/50 font-medium">{wallpapers.length} خلفية</span>
      </div>

      {/* Scrollable horizontal strip */}
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
        {wallpapers.map((w, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelectedWallpaper(i)}
            className="relative flex-shrink-0 w-[72px] rounded-2xl overflow-hidden aspect-[9/16] bg-secondary/30 border border-border/20 hover:border-primary/30 transition-all active:scale-95 shadow-sm"
          >
            <img src={w.src} alt={w.name} className="w-full h-full object-cover" loading="lazy" />
            {downloaded.has(i) && (
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Wallpaper preview modal */}
      {selectedWallpaper !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-8"
          onClick={() => setSelectedWallpaper(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-[240px] w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={wallpapers[selectedWallpaper].src}
              alt={wallpapers[selectedWallpaper].name}
              className="w-full rounded-3xl shadow-elevated"
            />
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-foreground/60 to-transparent rounded-b-3xl">
              <p className="text-[11px] text-card font-semibold text-center mb-2">{wallpapers[selectedWallpaper].name}</p>
              <button
                onClick={() => handleDownload(wallpapers[selectedWallpaper].src, wallpapers[selectedWallpaper].name, selectedWallpaper)}
                className="w-full py-2 rounded-xl bg-card/90 backdrop-blur-sm text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                {downloading === selectedWallpaper ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full" />
                ) : downloaded.has(selectedWallpaper) ? (
                  <><Check className="w-3.5 h-3.5 text-primary" /> تم التحميل</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> تحميل</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <p className="text-[9px] text-muted-foreground/40 text-center mt-2 font-medium">اضغط على الخلفية لمعاينتها</p>
    </div>
  );
};

export default WallpapersSection;
