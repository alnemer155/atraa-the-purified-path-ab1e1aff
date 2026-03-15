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
      {/* Frosted glass background */}
      <div className="bg-card/70 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.06)]">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                className="relative flex flex-col items-center gap-[3px] py-1 px-1.5 min-w-[44px] group"
              >
                {/* Active pill indicator */}
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -inset-x-1 -inset-y-0.5 rounded-2xl islamic-gradient opacity-90"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                  <div
                    className={`relative p-[7px] rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'text-primary-foreground scale-105'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  </div>
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] leading-none font-semibold transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/70'
                  }`}
                >
                  {label}
                </span>

                {/* Active dot */}
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
