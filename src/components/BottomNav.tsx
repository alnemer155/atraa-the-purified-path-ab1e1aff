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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-2xl border-t border-border/50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
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
                  <Icon className="w-[18px] h-[18px]" />
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
