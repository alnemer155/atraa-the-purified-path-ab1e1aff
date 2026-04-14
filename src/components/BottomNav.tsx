import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Settings, MessageSquare, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/settings', label: 'الإعدادات', icon: Settings },
  { path: '/quiz', label: 'المسابقة', icon: Trophy },
  { path: '/ai', label: 'الذكاء', icon: MessageSquare },
  { path: '/library', label: 'المكتبة', icon: BookOpen },
  { path: '/', label: 'الرئيسية', icon: Home },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-3 mb-2.5 rounded-[20px] border border-border/15 overflow-hidden">
        <div className="bg-card/60 backdrop-blur-3xl backdrop-saturate-200">
          <div className="flex items-center justify-around px-1 py-1.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(6);
                  }}
                  className="relative flex flex-col items-center gap-1 py-2 px-3.5 min-w-[48px]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl bg-primary/6"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-[18px] h-[18px] transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/45'
                    }`}
                    strokeWidth={isActive ? 1.8 : 1.3}
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
    </nav>
  );
};

export default BottomNav;
