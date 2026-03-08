import { useState, useEffect } from 'react';
import { getUser, getGreeting } from '@/lib/user';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PrayerTimes from '@/components/PrayerTimes';
import WeatherWidget from '@/components/WeatherWidget';
import HijriCountdown from '@/components/HijriCountdown';

const dhikrPhrases = [
  'اللهم صلِّ على محمد وآل محمد',
  'سبحان الله وبحمده',
  'الحمد لله رب العالمين',
  'استغفر الله ربي وأتوب إليه',
  'لا إله إلا الله',
  'اللهم عجّل لوليك الفرج',
  'يا أبا صالح المهدي أدركنا',
];

const HomePage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [dhikrIndex, setDhikrIndex] = useState(0);

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

  return (
    <div className="px-4 py-4 space-y-5 animate-fade-in">
      {/* Greeting - no background */}
      <div className="py-2">
        <p className="text-lg font-semibold text-foreground mb-2">{getGreeting(user)}</p>
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={dhikrIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              {dhikrPhrases[dhikrIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Weather + Hijri Countdown */}
      <div className="grid grid-cols-2 gap-3">
        <WeatherWidget />
        <HijriCountdown />
      </div>

      {/* Prayer Times */}
      <PrayerTimes />
    </div>
  );
};

export default HomePage;
