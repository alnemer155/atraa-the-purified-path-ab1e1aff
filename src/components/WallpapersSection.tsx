import { useState } from 'react';
import { Download, Check } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[12px] text-foreground">خلفيات عِتَرَةً</h2>
        <span className="text-[7px] text-muted-foreground/25 font-light">{wallpapers.length} خلفية</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1.5 -mx-4 px-4">
        {wallpapers.map((w, i) => (
          <motion.button
            key={i}
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
          </motion.button>
        ))}
      </div>

      {selectedWallpaper !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-md px-8"
          onClick={() => setSelectedWallpaper(null)}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-[200px] w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={wallpapers[selectedWallpaper].src}
              alt={wallpapers[selectedWallpaper].name}
              className="w-full rounded-2xl"
            />
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-foreground/40 to-transparent rounded-b-2xl">
              <p className="text-[9px] text-background/70 text-center mb-1.5 font-light">{wallpapers[selectedWallpaper].name}</p>
              <button
                onClick={() => handleDownload(wallpapers[selectedWallpaper].src, wallpapers[selectedWallpaper].name, selectedWallpaper)}
                className="w-full py-1.5 rounded-lg bg-background/85 backdrop-blur-sm text-foreground text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                {downloading === selectedWallpaper ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2.5 h-2.5 border-2 border-primary border-t-transparent rounded-full" />
                ) : downloaded.has(selectedWallpaper) ? (
                  <><Check className="w-2.5 h-2.5 text-primary" /> تم</>
                ) : (
                  <><Download className="w-2.5 h-2.5" /> تحميل</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default WallpapersSection;
