import { useState, useEffect } from 'react';
import { getUser, getGreeting, getLastReading, getTasbihState } from '@/lib/user';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, ChevronLeft, Sparkles, ArrowLeft } from 'lucide-react';
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
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const SectionHeader = ({ icon: Icon, title, iconBg, extra }: { icon: any; title: string; iconBg: string; extra?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-3.5">
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </div>
    {extra}
  </div>
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
      {/* ── Hero Greeting ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden px-5 pt-5 pb-6">
        {/* Decorative bg */}
        <div className="absolute inset-0 islamic-gradient opacity-[0.04] dark:opacity-[0.08]" />
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-accent/10 translate-x-1/3 translate-y-1/3 blur-2xl" />
        
        <div className="relative">
          <h1 className="text-xl font-bold text-foreground leading-snug tracking-tight">
            {getGreeting(user)}
          </h1>
          <div className="h-6 overflow-hidden mt-1.5">
            <AnimatePresence mode="wait">
              <motion.p
                key={dhikrIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="text-xs text-primary/70 font-semibold"
              >
                ✦ {dhikrPhrases[dhikrIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="px-4 space-y-6">
        {/* ── Resume Cards ── */}
        {(showTasbihResume || showLastReading) && (
          <motion.div variants={fadeUp} className="space-y-2.5">
            {showTasbihResume && tasbihState && (
              <button
                onClick={() => navigate('/library')}
                className="w-full flex items-center gap-3.5 p-4 rounded-2xl glass-card hover:border-primary/30 transition-all text-right active:scale-[0.98] group"
              >
                <div className="w-11 h-11 rounded-xl islamic-gradient flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                  <RotateCcw className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground">متابعة التسبيح</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {tasbihState.mode === 'zahra'
                      ? `${tasbihatLabels[tasbihState.step]} · ${tasbihState.count} من ${[34, 33, 33][tasbihState.step]}`
                      : `تسبيح حر · ${tasbihState.openCount} تسبيحة`
                    }
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground/20 flex-shrink-0 group-hover:text-primary/40 group-hover:-translate-x-0.5 transition-all" />
              </button>
            )}

            {showLastReading && lastReading && (
              <button
                onClick={() => navigate('/library')}
                className="w-full flex items-center gap-3.5 p-4 rounded-2xl glass-card hover:border-primary/30 transition-all text-right active:scale-[0.98] group"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground">متابعة القراءة</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-medium">
                    {categoryLabels[lastReading.category] || ''} · {lastReading.title}
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground/20 flex-shrink-0 group-hover:text-primary/40 group-hover:-translate-x-0.5 transition-all" />
              </button>
            )}
          </motion.div>
        )}

        {/* ── Weather + Hijri ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          <WeatherWidget />
          <HijriCountdown />
        </motion.div>

        {/* ── Prayer Times ── */}
        <motion.div variants={fadeUp}>
          <PrayerTimes />
        </motion.div>

        {/* ── Divider ── */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[10px] text-muted-foreground/40 font-semibold tracking-wider">الوسائط</span>
          <div className="flex-1 h-px bg-border/40" />
        </motion.div>

        {/* ── Listening ── */}
        <motion.div variants={fadeUp}>
          <ListeningSection />
        </motion.div>

        {/* ── Live Stream ── */}
        <motion.div variants={fadeUp}>
          <LiveStreamSection />
        </motion.div>

        {/* ── Wallpapers ── */}
        <motion.div variants={fadeUp}>
          <WallpapersSection />
        </motion.div>

        {/* ── Divider ── */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[10px] text-muted-foreground/40 font-semibold tracking-wider">اقتراحات</span>
          <div className="flex-1 h-px bg-border/40" />
        </motion.div>

        {/* ── Daily Recommendations ── */}
        <motion.div variants={fadeUp}>
          <DailyRecommendations />
        </motion.div>

        {/* ── Footer ── */}
        <motion.div variants={fadeUp} className="text-center pt-4 pb-2">
          <p className="text-[10px] text-muted-foreground/30 font-medium">
            عِتَرَةً · v3.3 بناء 160
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
