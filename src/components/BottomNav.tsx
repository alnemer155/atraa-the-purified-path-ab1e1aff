import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Compass, Settings, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const TasbihIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="6" r="2.5" />
    <circle cx="12" cy="12" r="2.5" />
    <circle cx="12" cy="18" r="2.5" />
    <circle cx="6" cy="9" r="2.5" />
    <circle cx="18" cy="9" r="2.5" />
    <circle cx="6" cy="15" r="2.5" />
    <circle cx="18" cy="15" r="2.5" />
  </svg>
);

const navItems = [
  { path: '/settings', label: 'الإعدادات', icon: Settings },
  { path: '/qibla', label: 'القبلة', icon: Compass },
  { path: '/tasbih', label: 'التسبيح', icon: null, customIcon: TasbihIcon },
  { path: '/ai', label: 'الذكاء', icon: MessageSquare },
  { path: '/duas', label: 'الأدعية', icon: BookOpen },
  { path: '/', label: 'الرئيسية', icon: Home },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-2xl border-t border-border/50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {navItems.map(({ path, label, icon: Icon, customIcon: CustomIcon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-0.5 py-1 px-2 min-w-[48px]"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl islamic-gradient shadow-card"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={`relative p-1.5 rounded-xl transition-colors duration-200 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {CustomIcon ? (
                    <CustomIcon className="w-[18px] h-[18px]" />
                  ) : Icon ? (
                    <Icon className="w-[18px] h-[18px]" />
                  ) : null}
                </div>
              </div>
              <span className={`text-[9px] font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
