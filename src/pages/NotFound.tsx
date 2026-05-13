import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * 404 — minimal, icon-only (no emoji), respects iOS PWA safe area.
 */
const NotFound = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    console.error('404: Route not found:', location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-6"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center max-w-sm w-full"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-secondary/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-7 h-7 text-foreground/70" strokeWidth={1.3} />
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 font-light tracking-[0.4em] mb-2">
          404
        </p>
        <h1 className="text-[18px] text-foreground font-light mb-2">
          {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
        </h1>
        <p className="text-[12px] text-muted-foreground/70 leading-relaxed mb-7 font-light">
          {isAr
            ? 'الرابط الذي طلبته غير متاح. ربّما تمّ نقله أو لم يعد موجوداً.'
            : 'The page you requested is not available. It may have been moved or removed.'}
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-foreground text-background text-[13px] active:scale-[0.97] transition-transform"
        >
          <Home className="w-4 h-4" strokeWidth={1.5} />
          {isAr ? 'العودة للرئيسية' : 'Back to home'}
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
