import { useState } from 'react';
import { Download, ImageIcon } from 'lucide-react';
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
    } catch {}
    setTimeout(() => setDownloading(null), 500);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">خلفيات عِتْرَةً</h2>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {wallpapers.map((w, i) => (
          <button
            key={i}
            onClick={() => handleDownload(w.src, w.name, i)}
            className="relative group rounded-xl overflow-hidden aspect-[9/16] bg-foreground/5 border border-border hover:border-primary/30 transition-all"
          >
            <img src={w.src} alt={w.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
              <Download className={`w-5 h-5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity ${downloading === i ? 'animate-bounce' : ''}`} />
            </div>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-3">سيتم إضافة المزيد قريباً</p>
    </div>
  );
};

export default WallpapersSection;
