import { useState, useEffect } from 'react';
import { getUser, getGreeting, getLastReading, getTasbihState } from '@/lib/user';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, ChevronLeft } from 'lucide-react';
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
    <div className="px-4 py-3 space-y-4 animate-fade-in">
      {/* Greeting */}
      <div className="py-1">
        <p className="text-base font-semibold text-foreground mb-1.5">{getGreeting(user)}</p>
        <div className="h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={dhikrIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-muted-foreground"
            >
              {dhikrPhrases[dhikrIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Continuation cards */}
      {(showTasbihResume || showLastReading) && (
        <div className="space-y-2">
          {showTasbihResume && tasbihState && (
            <button
              onClick={() => navigate('/library')}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/30 transition-all text-right"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">متابعة التسبيح</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {tasbihState.mode === 'zahra'
                    ? `${tasbihatLabels[tasbihState.step]} · ${tasbihState.count} من ${[34,33,33][tasbihState.step]}`
                    : `تسبيح حر · ${tasbihState.openCount} تسبيحة`
                  }
                </p>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )}

          {showLastReading && lastReading && (
            <button
              onClick={() => navigate('/library')}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/30 transition-all text-right"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">متابعة القراءة</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {categoryLabels[lastReading.category] || ''} · {lastReading.title}
                </p>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )}
        </div>
      )}

      {/* Weather + Hijri Countdown */}
      <div className="grid grid-cols-2 gap-2.5">
        <WeatherWidget />
        <HijriCountdown />
      </div>

      {/* Prayer Times */}
      <PrayerTimes />

      {/* Wallpapers */}
      <WallpapersSection />

      {/* Daily Recommendations */}
      <DailyRecommendations />
    </div>
  );
};

export default HomePage;
