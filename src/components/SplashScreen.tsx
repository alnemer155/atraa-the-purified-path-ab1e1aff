import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import splashImg from '@/assets/splash.png';

const SPLASH_KEY = 'atraa_splash_shown';

const SplashScreen = () => {
  const [show, setShow] = useState(() => {
    return !sessionStorage.getItem(SPLASH_KEY);
  });

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem(SPLASH_KEY, '1');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex flex-col items-center"
          >
            <img src={splashImg} alt="عِتَرَةً" className="w-24 h-24 rounded-[22px] object-contain mb-5" />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p className="text-lg text-foreground tracking-tight">عِتَرَةً</p>
              <p className="text-[11px] text-muted-foreground/60 text-center mt-1 font-light">منصة إسلامية شاملة</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
