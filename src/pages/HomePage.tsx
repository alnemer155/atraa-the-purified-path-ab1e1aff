import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLastReading, getTasbihState } from '@/lib/user';
import PrayerTimes from '@/components/PrayerTimes';
import WeatherWidget from '@/components/WeatherWidget';
import HijriCountdown from '@/components/HijriCountdown';
import DailyRecommendations from '@/components/DailyRecommendations';
import WallpapersSection from '@/components/WallpapersSection';

const dhikrPhrases = [
  'اللهم صلِّ على محمد وآل محمد',
  'سبحان الله وبحمده',
  'الحمد لله رب العالمين',
  'استغفر الله ربي وأتوب إليه',
  'لا إله إلا الله',
  'اللهم عجّل لوليك الفرج',
];

const tasbihatLabels = ['الله أكبر', 'الحمد لله', 'سبحان الله'];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const Chevron = isAr ? ChevronLeft : ChevronRight;
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const lastReading = getLastReading();
  const tasbihState = getTasbihState();

  useEffect(() => {
    const interval = setInterval(() => {
      setDhikrIndex(prev => (prev + 1) % dhikrPhrases.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const showTasbihResume = tasbihState && tasbihState.timestamp > Date.now() - 86400000 &&
    (tasbihState.mode === 'open' ? tasbihState.openCount > 0 : tasbihState.count > 0 || tasbihState.step > 0);

  const showLastReading = lastReading && lastReading.timestamp > Date.now() - 604800000;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="pb-6"
    >
      {/* Greeting */}
      <motion.div variants={fadeUp} className={`px-5 pt-5 pb-3 ${isAr ? 'text-right' : 'text-left'}`}>
        <h1 className="text-[20px] text-foreground leading-snug tracking-tight font-semibold">
          {t('home.greeting')}
        </h1>
        {isAr && (
          <div className="h-5 overflow-hidden mt-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={dhikrIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] text-primary/70"
              >
                {dhikrPhrases[dhikrIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <div className="px-4 space-y-3">
        {/* Resume cards */}
        {(showTasbihResume || showLastReading) && (
          <motion.div variants={fadeUp} className="space-y-1.5">
            {showTasbihResume && tasbihState && (
              <button
                onClick={() => navigate('/library')}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 active:scale-[0.98] transition-transform shadow-card ${isAr ? 'text-right' : 'text-left'}`}
              >
                <RotateCcw className="w-4 h-4 text-primary/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground font-medium">{t('library.tasbih')}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {tasbihState.mode === 'zahra'
                      ? `${tasbihatLabels[tasbihState.step]} · ${tasbihState.count}/${[34, 33, 33][tasbihState.step]}`
                      : `${tasbihState.openCount}`
                    }
                  </p>
                </div>
                <Chevron className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              </button>
            )}

            {showLastReading && lastReading && (
              <button
                onClick={() => navigate('/library')}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 active:scale-[0.98] transition-transform shadow-card ${isAr ? 'text-right' : 'text-left'}`}
              >
                <BookOpen className="w-4 h-4 text-primary/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground font-medium">{t('library.title')}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {lastReading.title}
                  </p>
                </div>
                <Chevron className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              </button>
            )}
          </motion.div>
        )}

        {/* Weather & Hijri */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
          <WeatherWidget />
          <HijriCountdown />
        </motion.div>

        {/* Prayer Times */}
        <motion.div variants={fadeUp}>
          <PrayerTimes />
        </motion.div>

        <motion.div variants={fadeUp}>
          <WallpapersSection />
        </motion.div>

        <motion.div variants={fadeUp}>
          <DailyRecommendations />
        </motion.div>

        {/* Footer */}
        <motion.div variants={fadeUp} className="flex items-center justify-center pt-10 pb-4">
          <p className="text-[9px] text-muted-foreground/40 tracking-wide">
            {t('app.name')} · {t('app.version')}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
