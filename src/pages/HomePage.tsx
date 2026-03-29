import { useState, useEffect } from 'react';
import { getUser, getGreeting, getLastReading, getTasbihState } from '@/lib/user';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, ChevronLeft, Sparkles } from 'lucide-react';
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
  'يا أبا صالح المهدي أدركنا',
];

const categoryLabels: Record<string, string> = {
  dua: 'دعاء',
  ziyara: 'زيارة',
  dhikr: 'ذكر',
};

const tasbihatLabels = ['الله اكبر', 'الحمد لله', 'سبحان الله'];

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const lastReading = getLastReading();
  const tasbihState = getTasbihState();

  useEffect(() => {
    if (!user?.registered) {
      navigate('/register');
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDhikrIndex(prev => (prev + 1) % dhikrPhrases.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const showTasbihResume = tasbihState && tasbihState.timestamp > Date.now() - 86400000 &&
    (tasbihState.mode === 'open' ? tasbihState.openCount > 0 : tasbihState.count > 0 || tasbihState.step > 0);

  const showLastReading = lastReading && lastReading.timestamp > Date.now() - 604800000;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="px-4 pt-3 pb-4 space-y-5"
    >
      {/* Greeting Section */}
      <motion.div variants={fadeUp} className="py-2">
        <h1 className="text-lg font-bold text-foreground leading-snug">{getGreeting(user)}</h1>
        <div className="h-5 overflow-hidden mt-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={dhikrIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-muted-foreground font-medium"
            >
              {dhikrPhrases[dhikrIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Resume Cards */}
      {(showTasbihResume || showLastReading) && (
        <motion.div variants={fadeUp} className="space-y-2">
          {showTasbihResume && tasbihState && (
            <button
              onClick={() => navigate('/library')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl glass-card hover:border-primary/30 transition-all text-right active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl islamic-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                <RotateCcw className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground">متابعة التسبيح</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {tasbihState.mode === 'zahra'
                    ? `${tasbihatLabels[tasbihState.step]} · ${tasbihState.count} من ${[34, 33, 33][tasbihState.step]}`
                    : `تسبيح حر · ${tasbihState.openCount} تسبيحة`
                  }
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
            </button>
          )}

          {showLastReading && lastReading && (
            <button
              onClick={() => navigate('/library')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl glass-card hover:border-primary/30 transition-all text-right active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4.5 h-4.5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground">متابعة القراءة</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {categoryLabels[lastReading.category] || ''} · {lastReading.title}
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
            </button>
          )}
        </motion.div>
      )}

      {/* Weather + Hijri Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <WeatherWidget />
        <HijriCountdown />
      </motion.div>

      {/* Prayer Times */}
      <motion.div variants={fadeUp}>
        <PrayerTimes />
      </motion.div>

      {/* Wallpapers */}
      <motion.div variants={fadeUp}>
        <WallpapersSection />
      </motion.div>

      {/* Daily Recommendations */}
      <motion.div variants={fadeUp}>
        <DailyRecommendations />
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
