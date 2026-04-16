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
      <div className="mx-3 mb-2 rounded-2xl border border-border/10 overflow-hidden">
        <div className="bg-background/70 backdrop-blur-3xl backdrop-saturate-200">
          <div className="flex items-center justify-around px-1 py-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(4);
                  }}
                  className="relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[44px]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-foreground/[0.04]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-[17px] h-[17px] transition-colors duration-200 ${
                      isActive ? 'text-foreground' : 'text-muted-foreground/35'
                    }`}
                    strokeWidth={isActive ? 1.6 : 1.2}
                  />
                  <span
                    className={`relative z-10 text-[8px] leading-none transition-colors duration-200 ${
                      isActive ? 'text-foreground' : 'text-muted-foreground/30'
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
