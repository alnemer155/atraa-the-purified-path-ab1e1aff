import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, BookText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BookAlt from './icons/BookAlt';
import { useQuranPause } from '@/lib/quran-paused';

const BottomNav = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { paused: quranPaused } = useQuranPause();

  const items = [
    { path: '/settings', label: t('nav.settings'), icon: Settings },
    // Hide Quran tab while paused (v2.10.50 — admin-controlled pause).
    ...(quranPaused ? [] : [{ path: '/quran', label: isAr ? 'القرآن' : 'Quran', icon: BookText }]),
    { path: '/library', label: t('nav.library'), icon: BookAlt },
    { path: '/', label: t('nav.home'), icon: Home },
  ];

  // Apple-style ordering: home is on the right in Arabic, on the left in English
  const ordered = isAr ? items : [...items].reverse();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-4 mb-3 pointer-events-auto">
        <div className="glass-nav rounded-[28px] overflow-hidden">
          <div className="flex items-center justify-around px-2 py-2">
            {ordered.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(4);
                  }}
                  className="relative flex flex-col items-center gap-1 py-2 px-4 min-w-[62px]"
                  aria-label={label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl bg-gold/10 border-[0.5px] border-gold/25"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-[20px] h-[20px] transition-colors duration-200 ${
                      isActive ? 'text-gold' : 'text-muted-foreground/55'
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span
                    className={`relative z-10 text-[9px] leading-none tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-gold font-bold' : 'text-muted-foreground/55'
                    }`}
                  >
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
