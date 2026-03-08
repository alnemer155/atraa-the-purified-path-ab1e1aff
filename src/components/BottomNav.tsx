import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Compass, Settings, MessageSquare } from 'lucide-react';

const navItems = [
  { path: '/settings', label: 'الإعدادات', icon: Settings },
  { path: '/qibla', label: 'القبلة', icon: Compass },
  { path: '/ai', label: 'الذكاء', icon: MessageSquare },
  { path: '/duas', label: 'الأدعية', icon: BookOpen },
  { path: '/', label: 'الرئيسية', icon: Home },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
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
