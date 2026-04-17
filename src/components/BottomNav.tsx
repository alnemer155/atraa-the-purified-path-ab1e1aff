import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const items = [
    { path: '/settings', label: t('nav.settings'), icon: Settings },
    { path: '/library', label: t('nav.library'), icon: BookOpen },
    { path: '/', label: t('nav.home'), icon: Home },
  ];

  // Apple-style ordering: home is on the right in Arabic, on the left in English
  const ordered = isAr ? items : [...items].reverse();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-3 mb-2 pointer-events-auto">
        <div className="rounded-[28px] overflow-hidden border border-white/20 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {/* iOS 26 Liquid Glass effect */}
          <div className="bg-background/55 backdrop-blur-[40px] backdrop-saturate-200">
            <div className="flex items-center justify-around px-2 py-1.5">
              {ordered.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(4);
                    }}
                    className="relative flex flex-col items-center gap-1 py-2 px-4 min-w-[64px]"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-2xl bg-foreground/[0.06]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 w-[19px] h-[19px] transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-muted-foreground/45'
                      }`}
                      strokeWidth={isActive ? 1.8 : 1.4}
                    />
                    <span
                      className={`relative z-10 text-[9px] leading-none transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-muted-foreground/40'
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
      </div>
    </nav>
  );
};

export default BottomNav;
