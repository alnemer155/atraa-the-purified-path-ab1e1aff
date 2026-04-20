import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '@/contexts/UIContext';

const AppLayout = () => {
  const { i18n } = useTranslation();
  const { hideHeader, hideBottomNav } = useUI();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // Desktop block lifted: app is now fully responsive on tablets/desktop.
  return (
    <div className="min-h-screen bg-background max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto relative">
      {!hideHeader && <AppHeader />}
      <main className="safe-bottom">
        <Outlet />
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
