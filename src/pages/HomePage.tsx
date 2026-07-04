import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLastReading, getTasbihState } from '@/lib/user';
import PrayerTimes from '@/components/PrayerTimes';
import HijriCountdown from '@/components/HijriCountdown';
import WallpapersSection from '@/components/WallpapersSection';
import KhatmaSection from '@/components/KhatmaSection';
import AtharSection from '@/components/AtharSection';

// Mixed devotional rotation next to the greeting: short ayat, salawat, du'a.
type DevotionalItem = { text: string; type: 'ayah' | 'salawat' | 'dua' };

const DEVOTIONAL_ROTATION: DevotionalItem[] = [
  { text: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًۭا', type: 'ayah' },
  { text: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا', type: 'ayah' },
  { text: 'حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ', type: 'ayah' },
  { text: 'وَٱصْبِرُوا۟ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ', type: 'ayah' },
  { text: 'وَقُل رَّبِّ زِدْنِى عِلْمًۭا', type: 'ayah' },
  { text: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ', type: 'ayah' },
  { text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّد', type: 'salawat' },
  { text: 'اللَّهُمَّ عَجِّلْ لِوَلِيِّكَ الْفَرَج', type: 'salawat' },
  { text: 'اللَّهُمَّ كُنْ لِوَلِيِّكَ الْحُجَّةِ بْنِ الْحَسَن', type: 'salawat' },
  { text: 'يَا عَلِيُّ يَا عَظِيم', type: 'dua' },
  { text: 'يَا حُسَيْنُ يَا شَهِيد', type: 'dua' },
  { text: 'حَسْبِيَ اللَّهُ لِدِينِي وَدُنْيَاي', type: 'dua' },
  { text: 'يا عليُّ أدرِكني', type: 'dua' },
  { text: 'ربِّ اغفر لي ولوالديَّ', type: 'dua' },
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
  const [devotionalIndex, setDevotionalIndex] = useState(() =>
    new Date().getDate() % DEVOTIONAL_ROTATION.length
  );
  const lastReading = getLastReading();
  const tasbihState = getTasbihState();

  useEffect(() => {
    const interval = setInterval(() => {
      setDevotionalIndex(prev => (prev + 1) % DEVOTIONAL_ROTATION.length);
    }, 25000);
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
      {/* Greeting — v2.13.15 GlassUI: kicker + big heading + devotional line */}
      <motion.div variants={fadeUp} className={`px-6 pt-6 pb-4 ${isAr ? 'text-right' : 'text-left'}`}>
        <p className="kicker mb-2">{isAr ? 'اليوم' : 'Today'}</p>
        <h1 className="text-[26px] text-foreground leading-tight tracking-tight font-bold">
          {t('home.greeting')}
        </h1>
        {isAr && (
          <div className="mt-2 min-h-[26px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={devotionalIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={
                  DEVOTIONAL_ROTATION[devotionalIndex].type === 'ayah'
                    ? 'quran-uthmani text-[15px] text-muted-foreground leading-relaxed italic'
                    : 'text-[13px] text-muted-foreground leading-relaxed'
                }
                dir="rtl"
              >
                {DEVOTIONAL_ROTATION[devotionalIndex].text}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <div className="px-5 space-y-6">
        {/* Resume cards — v2.13.15 glass rows */}
        {(showTasbihResume || showLastReading) && (
          <motion.div variants={fadeUp} className="space-y-2">
            {showTasbihResume && tasbihState && (
              <button
                onClick={() => navigate('/library')}
                className={`w-full flex items-center gap-3 p-3.5 glass-card-soft active:scale-[0.98] transition-transform ${isAr ? 'text-right' : 'text-left'}`}
              >
                <RotateCcw className="w-4 h-4 text-gold flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground font-bold">{t('library.tasbih')}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {tasbihState.mode === 'zahra'
                      ? `${tasbihatLabels[tasbihState.step]} · ${tasbihState.count}/${[34, 33, 33][tasbihState.step]}`
                      : `${tasbihState.openCount}`
                    }
                  </p>
                </div>
                <Chevron className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              </button>
            )}

            {showLastReading && lastReading && (
              <button
                onClick={() => navigate('/library')}
                className={`w-full flex items-center gap-3 p-3.5 glass-card-soft active:scale-[0.98] transition-transform ${isAr ? 'text-right' : 'text-left'}`}
              >
                <BookOpen className="w-4 h-4 text-gold flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground font-bold">{t('library.title')}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {lastReading.title}
                  </p>
                </div>
                <Chevron className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              </button>
            )}
          </motion.div>
        )}

        {/* Hijri calendar — enlarged, full-width (v2.11.16) */}
        <motion.div variants={fadeUp}>
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
          <KhatmaSection />
        </motion.div>

        <motion.div variants={fadeUp}>
          <AtharSection />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
