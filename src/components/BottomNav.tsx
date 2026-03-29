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
      {/* Apple Glass effect */}
      <div className="mx-3 mb-2 rounded-[22px] border border-border/30 shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.12),inset_0_1px_0_0_hsl(var(--card)/0.6)] overflow-hidden">
        <div className="bg-card/60 backdrop-blur-2xl backdrop-saturate-[1.8]">
          <div className="flex items-center justify-around px-1 py-1.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  className="relative flex flex-col items-center gap-[2px] py-1.5 px-2 min-w-[48px] group"
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="glass-pill"
                      className="absolute inset-0 rounded-2xl bg-primary/12"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}

                  <div className="relative z-10">
                    <Icon
                      className={`w-[20px] h-[20px] transition-all duration-200 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground/70 group-hover:text-foreground/80'
                      }`}
                      strokeWidth={isActive ? 2.3 : 1.7}
                    />
                  </div>

                  <span
                    className={`relative z-10 text-[9px] leading-none font-semibold transition-all duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground/60'
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
