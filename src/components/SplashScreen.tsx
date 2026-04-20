import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSeasonalLogo } from '@/lib/seasonal-logo';

const logo = getSeasonalLogo();

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen = ({ onFinish, duration = 1800 }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      // Allow exit animation to complete
      setTimeout(onFinish, 450);
    }, duration);
    return () => clearTimeout(t);
  }, [onFinish, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.08)_0%,_transparent_60%)]" />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.05,
            }}
            className="relative flex flex-col items-center"
          >
            <motion.img
              src={logo}
              alt="Atraa"
              className="h-12 w-auto object-contain"
              style={{ maxHeight: 48 }}
              animate={{
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 36, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-px bg-foreground/20 mt-5"
            />
          </motion.div>

          {/* Bottom loading dot */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-12 flex items-center gap-1.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-foreground/30"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
