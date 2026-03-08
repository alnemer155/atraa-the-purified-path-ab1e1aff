import { useState, useEffect, useCallback } from 'react';
import { getUser, getGreeting } from '@/lib/user';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PrayerTimes from '@/components/PrayerTimes';
import DigitalTasbih from '@/components/DigitalTasbih';

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
      {/* Greeting Section */}
      <div className="rounded-2xl islamic-gradient p-5 text-primary-foreground shadow-elevated">
        <p className="text-base font-semibold mb-3">{getGreeting(user)}</p>
        <div className="h-7 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={dhikrIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="text-sm opacity-90"
            >
              {dhikrPhrases[dhikrIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Prayer Times */}
      <PrayerTimes />

      {/* Digital Tasbih */}
      <DigitalTasbih />
    </div>
  );
};

export default HomePage;
