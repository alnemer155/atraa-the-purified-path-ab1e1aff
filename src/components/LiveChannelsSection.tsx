import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Live channels — shown to Sunni users in place of the Atraa wallpapers.
 * Streams the official Saudi Broadcasting Authority (SBA) feeds for the two
 * Holy Mosques. We embed YouTube live links from the official SBA channels.
 *
 * Sources:
 *   - Quran TV (Al-Masjid al-Nabawi / Al-Masjid al-Haram official) → @QuranTV
 *   - Sunnah TV → @SunnahTV
 *
 * NOTE: per project policy, no music. These are official Quran/Adhan/Khutba
 * streams only.
 */

type Channel = {
  id: string;
  name: string;
  subtitle: string;
  // YouTube live URL — opens in-app overlay via embed, or external on click.
  embed: string;
  external: string;
};

const CHANNELS: Channel[] = [
  {
    id: 'haramain-makkah',
    name: 'قناة القرآن الكريم — الحرم المكي',
    subtitle: 'البث المباشر · هيئة الإذاعة والتلفزيون السعودية',
    embed: 'https://www.youtube.com/embed/live_stream?channel=UCxiqUTWZmpLQyhWiqK8WMcA',
    external: 'https://www.youtube.com/@QuranTV/live',
  },
  {
    id: 'haramain-madinah',
    name: 'قناة السنة النبوية — المسجد النبوي',
    subtitle: 'البث المباشر · هيئة الإذاعة والتلفزيون السعودية',
    embed: 'https://www.youtube.com/embed/live_stream?channel=UC8gj40-7gxOHJhXThGT1cmA',
    external: 'https://www.youtube.com/@SunnahTV/live',
  },
];

const LiveChannelsSection = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [active, setActive] = useState<Channel | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className={`text-[12px] text-foreground ${isAr ? 'text-right' : 'text-left'}`}>
          {isAr ? 'البث المباشر للحرمين' : 'Haramain Live'}
        </h2>
        <span className="text-[8px] text-muted-foreground/40 font-light">
          {isAr ? 'هيئة الإذاعة والتلفزيون' : 'SBA Official'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c)}
            className="w-full p-3.5 rounded-2xl bg-card border border-border/30 active:scale-[0.99] transition-all flex items-center gap-3 text-right"
            dir="rtl"
          >
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-foreground/70" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-foreground font-medium truncate">{c.name}</p>
              <p className="text-[9px] text-muted-foreground/60 font-light mt-0.5 truncate">{c.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-muted-foreground/70 font-light">LIVE</span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <button
                onClick={() => setActive(null)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <p className="text-[12px] text-white/90 truncate mx-3 flex-1 text-center">{active.name}</p>
              <a
                href={active.external}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="open external"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </a>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black">
              <iframe
                src={active.embed}
                title={active.name}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <p className="text-[9px] text-white/40 text-center font-light py-2">
              {isAr
                ? 'البث من هيئة الإذاعة والتلفزيون السعودية'
                : 'Stream by Saudi Broadcasting Authority'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveChannelsSection;
