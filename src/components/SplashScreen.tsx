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
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex flex-col items-center"
          >
            <img src={splashImg} alt="عِتَرَةً" className="w-20 h-20 rounded-[20px] object-contain mb-4" />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-base text-foreground tracking-tight">عِتَرَةً</p>
              <p className="text-[10px] text-muted-foreground/50 text-center mt-0.5 font-light">منصة إسلامية شاملة</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
