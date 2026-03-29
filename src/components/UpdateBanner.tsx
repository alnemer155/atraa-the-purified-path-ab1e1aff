import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENT_VERSION = 'v3.0';
const BANNER_KEY = 'atraa_update_dismissed';

const UpdateBanner = () => {
  const [visible, setVisible] = useState(() => {
    const dismissed = localStorage.getItem(BANNER_KEY);
    return dismissed !== CURRENT_VERSION;
  });

  const dismiss = (permanent: boolean) => {
    setVisible(false);
    if (permanent) {
      localStorage.setItem(BANNER_KEY, CURRENT_VERSION);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="mx-4 mb-3 rounded-2xl islamic-gradient p-3 shadow-elevated relative overflow-hidden"
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[size:12px_12px]" />
          
          <div className="relative flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary-foreground">تحديث جديد {CURRENT_VERSION}</p>
              <p className="text-[10px] text-primary-foreground/70 mt-0.5 leading-relaxed">
                تصميم جديد وتجربة مُحسّنة بالكامل
              </p>
            </div>
            <button
              onClick={() => dismiss(false)}
              className="w-6 h-6 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-3 h-3 text-primary-foreground" />
            </button>
          </div>
          <button
            onClick={() => dismiss(true)}
            className="relative mt-2 text-[9px] text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors"
          >
            لا تظهر مرة أخرى
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateBanner;
