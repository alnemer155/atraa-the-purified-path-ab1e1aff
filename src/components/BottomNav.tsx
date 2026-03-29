import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Compass, Settings, MessageSquare, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/settings', label: 'الإعدادات', icon: Settings },
  { path: '/qibla', label: 'القبلة', icon: Compass },
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
      <div className="mx-2.5 mb-2 rounded-2xl border border-border/20 shadow-[0_4px_24px_-4px_hsl(var(--foreground)/0.08)] overflow-hidden">
        <div className="bg-card/55 backdrop-blur-3xl backdrop-saturate-[1.9]">
          <div className="flex items-center justify-around px-1 py-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  className="relative flex flex-col items-center gap-0.5 py-2 px-2.5 min-w-[46px] group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-[14px] bg-primary/8"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <div className="relative z-10">
                    <Icon
                      className={`w-[19px] h-[19px] transition-all duration-200 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground/60 group-hover:text-foreground/70'
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.6}
                    />
                  </div>
                  <span
                    className={`relative z-10 text-[9px] leading-none font-semibold transition-all duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-foreground/50'
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
