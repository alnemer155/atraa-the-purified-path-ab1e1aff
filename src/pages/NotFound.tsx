import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    console.error('404: Route not found:', location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-6"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm w-full"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-secondary/40 mb-5">
          <span className="text-2xl text-foreground/70 tracking-tight font-light">404</span>
        </div>

        <h1 className="text-[18px] text-foreground mb-1.5">
          {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
        </h1>
        <p className="text-[12px] text-muted-foreground/60 leading-relaxed mb-6 font-light">
          {isAr
            ? 'الرابط الذي طلبته غير متاح. يمكنك العودة للرئيسية.'
            : 'The page you requested is not available. You can return home.'}
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-foreground text-background text-[13px] active:scale-[0.97] transition-transform"
        >
          <Home className="w-4 h-4" />
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
