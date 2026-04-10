import { useState, useEffect } from 'react';
import { getUser, getGreeting, getLastReading, getTasbihState } from '@/lib/user';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, ChevronLeft, Minus } from 'lucide-react';
import PrayerTimes from '@/components/PrayerTimes';
import WeatherWidget from '@/components/WeatherWidget';
import HijriCountdown from '@/components/HijriCountdown';
import DailyRecommendations from '@/components/DailyRecommendations';
import WallpapersSection from '@/components/WallpapersSection';
import LiveStreamSection from '@/components/LiveStreamSection';
import ListeningSection from '@/components/ListeningSection';

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
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const SectionDivider = ({ label }: { label: string }) => (
  <motion.div variants={fadeUp} className="flex items-center gap-3 py-2">
    <div className="flex-1 h-px bg-border/30" />
    <span className="text-[10px] text-muted-foreground/50 tracking-wider font-light">{label}</span>
    <div className="flex-1 h-px bg-border/30" />
  </motion.div>
);

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
      className="pb-6"
    >
      {/* ── التحية ── */}
      <motion.div variants={fadeUp} className="px-5 pt-6 pb-5">
        <h1 className="text-xl text-foreground leading-snug tracking-tight">
          {getGreeting(user)}
        </h1>
        <div className="h-5 overflow-hidden mt-1.5">
          <AnimatePresence mode="wait">
            <motion.p
              key={dhikrIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] text-muted-foreground font-light"
            >
              {dhikrPhrases[dhikrIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="px-4 space-y-5">
        {/* ── بطاقات المتابعة ── */}
        {(showTasbihResume || showLastReading) && (
          <motion.div variants={fadeUp} className="space-y-2">
            {showTasbihResume && tasbihState && (
              <button
                onClick={() => navigate('/library')}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 transition-all text-right active:scale-[0.98] group"
              >
                <RotateCcw className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground">متابعة التسبيح</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-light">
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
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 transition-all text-right active:scale-[0.98] group"
              >
                <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground">متابعة القراءة</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-light">
                    {categoryLabels[lastReading.category] || ''} · {lastReading.title}
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
              </button>
            )}
          </motion.div>
        )}

        {/* ── الطقس والتقويم ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2.5">
          <WeatherWidget />
          <HijriCountdown />
        </motion.div>

        {/* ── أوقات الصلاة ── */}
        <motion.div variants={fadeUp}>
          <PrayerTimes />
        </motion.div>

        <SectionDivider label="الوسائط" />

        {/* ── الاستماع ── */}
        <motion.div variants={fadeUp}>
          <ListeningSection />
        </motion.div>

        {/* ── البث المباشر ── */}
        <motion.div variants={fadeUp}>
          <LiveStreamSection />
        </motion.div>

        {/* ── الخلفيات ── */}
        <motion.div variants={fadeUp}>
          <WallpapersSection />
        </motion.div>

        <SectionDivider label="اقتراحات" />

        {/* ── مقترحات اليوم ── */}
        <motion.div variants={fadeUp}>
          <DailyRecommendations />
        </motion.div>

        {/* ── التذييل ── */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 pt-6 pb-3">
          <Minus className="w-3 h-3 text-muted-foreground/20" />
          <p className="text-[10px] text-muted-foreground/30 font-light">
            عِتَرَةً · الإصدار ٥.٠ · بناء ٣٠٠
          </p>
          <Minus className="w-3 h-3 text-muted-foreground/20" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
